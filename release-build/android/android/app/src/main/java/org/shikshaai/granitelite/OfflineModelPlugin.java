package org.shikshaai.granitelite;

import android.content.Context;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "OfflineModel")
public class OfflineModelPlugin extends Plugin {
    private static final String MODEL_NAME = "granite-3.0-1b-a400m-instruct-Q3_K_M.gguf";
    private static final String MODEL_DISPLAY_NAME = "IBM Granite 3.0 1B-A400M Q3_K_M";
    private static final String MODEL_ASSET = "models/" + MODEL_NAME;
    private static final long MODEL_SIZE = 658578464L;
    private static final String MODEL_SHA256 = "ecb21263c3b4121aaedb4da26b3b1e8c00e6f8b271142644c882c8bd4fb51dad";
    private static final String LEGACY_MODEL_NAME = "granite-3.3-2b-instruct-Q4_K_M.gguf";
    private static final String LEGACY_MODEL_DISPLAY_NAME = "IBM Granite 3.3 2B Q4_K_M";
    private final ExecutorService inferenceExecutor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void getModelStatus(PluginCall call) {
        File model = existingModelFile();
        boolean bundled = bundledModelAvailable();
        JSObject status = new JSObject();
        status.put("installed", model != null || bundled);
        status.put("running", GraniteNative.isModelLoaded());
        status.put("name", model != null && LEGACY_MODEL_NAME.equals(model.getName())
            ? LEGACY_MODEL_DISPLAY_NAME
            : MODEL_DISPLAY_NAME);
        status.put("modelPath", model != null ? model.getAbsolutePath() : modelFile(MODEL_NAME).getAbsolutePath());
        call.resolve(status);
    }

    @PluginMethod
    public void ask(PluginCall call) {
        String question = safeText(call.getString("question", ""), 2000).trim();
        if (question.isEmpty()) {
            call.reject("Please enter a question between 1 and 2,000 characters.");
            return;
        }

        String requestId = call.getString("requestId", "");
        String mode = call.getString("mode", "learn");
        String courseContext = safeText(call.getString("courseContext", ""), 8000);
        JSArray history = call.getArray("history", new JSArray());

        inferenceExecutor.execute(() -> {
            try {
                File model = ensureModelFile();
                if (!GraniteNative.isModelLoaded() && !GraniteNative.loadModel(model.getAbsolutePath())) {
                    throw new IllegalStateException("The Granite model could not be loaded on this device.");
                }

                String prompt = GranitePrompt.build(question, history, mode, courseContext);
                String answer = GraniteNative.generate(prompt, 240, token -> {
                    String safeToken = GranitePrompt.sanitizeChunk(token);
                    if (safeToken.isEmpty()) return;
                    JSObject event = new JSObject();
                    event.put("requestId", requestId);
                    event.put("text", safeToken);
                    getActivity().runOnUiThread(() -> notifyListeners("modelChunk", event));
                });
                String safeAnswer = GranitePrompt.sanitizeAnswer(answer);
                if (safeAnswer.isEmpty()) throw new IllegalStateException("The offline tutor returned an empty answer.");
                JSObject result = new JSObject();
                result.put("answer", safeAnswer);
                call.resolve(result);
            } catch (Exception error) {
                call.reject("The offline tutor could not process that question.", error);
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        inferenceExecutor.shutdownNow();
    }

    private File ensureModelFile() throws Exception {
        File existing = existingModelFile();
        if (existing != null) return existing;
        if (!bundledModelAvailable()) {
            throw new IllegalStateException("The Granite model is not included in this application.");
        }

        File target = modelFile(MODEL_NAME);
        File directory = target.getParentFile();
        if (directory == null || (!directory.isDirectory() && !directory.mkdirs())) {
            throw new IllegalStateException("The application model directory could not be created.");
        }

        File temporary = new File(directory, MODEL_NAME + ".part");
        if (temporary.exists() && !temporary.delete()) {
            throw new IllegalStateException("An incomplete model installation could not be cleared.");
        }

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (
            InputStream input = new BufferedInputStream(getContext().getAssets().open(MODEL_ASSET));
            BufferedOutputStream output = new BufferedOutputStream(new FileOutputStream(temporary))
        ) {
            byte[] buffer = new byte[1024 * 1024];
            int count;
            while ((count = input.read(buffer)) != -1) {
                output.write(buffer, 0, count);
                digest.update(buffer, 0, count);
            }
        } catch (Exception error) {
            temporary.delete();
            throw error;
        }

        String checksum = toHex(digest.digest());
        if (temporary.length() != MODEL_SIZE || !MODEL_SHA256.equals(checksum)) {
            temporary.delete();
            throw new IllegalStateException("The bundled Granite model failed its integrity check.");
        }
        if (!temporary.renameTo(target)) {
            temporary.delete();
            throw new IllegalStateException("The Granite model could not be installed.");
        }
        return target;
    }

    private File existingModelFile() {
        File mobile = modelFile(MODEL_NAME);
        if (mobile.isFile() && mobile.canRead() && mobile.length() == MODEL_SIZE) return mobile;
        File legacy = modelFile(LEGACY_MODEL_NAME);
        return legacy.isFile() && legacy.canRead() ? legacy : null;
    }

    private boolean bundledModelAvailable() {
        try (InputStream ignored = getContext().getAssets().open(MODEL_ASSET)) {
            return true;
        } catch (Exception error) {
            return false;
        }
    }

    private File modelFile(String name) {
        Context context = getContext();
        File root = context.getExternalFilesDir(null);
        if (root == null) root = context.getFilesDir();
        return new File(new File(root, "models"), name);
    }

    private static String toHex(byte[] bytes) {
        StringBuilder output = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            output.append(String.format("%02x", value & 0xff));
        }
        return output.toString();
    }

    private static String safeText(String value, int limit) {
        String cleaned = value
            .replace("<|start_of_role|>", "")
            .replace("<|end_of_role|>", "")
            .replace("<|end_of_text|>", "")
            .replace("<|start_of_cite|>", "")
            .replace("<|end_of_cite|>", "");
        return cleaned.substring(0, Math.min(cleaned.length(), limit));
    }
}

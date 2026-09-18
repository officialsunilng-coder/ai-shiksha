package org.shikshaai.granitelite;

final class GraniteNative {
    interface TokenCallback {
        void onToken(String token);
    }

    static {
        System.loadLibrary("shikshaai_granite");
    }

    private GraniteNative() {}

    static native boolean loadModel(String modelPath);

    static native boolean isModelLoaded();

    static native String generate(String prompt, int maxTokens, TokenCallback callback);
}

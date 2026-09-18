#include <jni.h>
#include <algorithm>
#include <mutex>
#include <string>
#include <thread>
#include <vector>
#include "llama.h"

namespace {
std::mutex model_mutex;
llama_model * model = nullptr;
llama_context * context = nullptr;
const llama_vocab * vocab = nullptr;

std::vector<llama_token> tokenize(const std::string & text) {
    int32_t count = llama_tokenize(vocab, text.c_str(), static_cast<int32_t>(text.size()), nullptr, 0, true, true);
    if (count >= 0) return {};
    std::vector<llama_token> tokens(static_cast<size_t>(-count));
    count = llama_tokenize(vocab, text.c_str(), static_cast<int32_t>(text.size()), tokens.data(), static_cast<int32_t>(tokens.size()), true, true);
    if (count < 0) return {};
    tokens.resize(static_cast<size_t>(count));
    return tokens;
}

std::string token_piece(llama_token token) {
    std::vector<char> buffer(16);
    int32_t count = llama_token_to_piece(vocab, token, buffer.data(), static_cast<int32_t>(buffer.size()), 0, false);
    if (count < 0) {
        buffer.resize(static_cast<size_t>(-count));
        count = llama_token_to_piece(vocab, token, buffer.data(), static_cast<int32_t>(buffer.size()), 0, false);
    }
    return count > 0 ? std::string(buffer.data(), static_cast<size_t>(count)) : std::string();
}

bool decode_prompt(const std::vector<llama_token> & tokens) {
    constexpr int32_t batch_size = 512;
    llama_batch batch = llama_batch_init(batch_size, 0, 1);
    for (size_t offset = 0; offset < tokens.size(); offset += batch_size) {
        const int32_t count = static_cast<int32_t>(std::min(tokens.size() - offset, static_cast<size_t>(batch_size)));
        batch.n_tokens = 0;
        for (int32_t index = 0; index < count; index++) {
            const int32_t batch_index = batch.n_tokens;
            batch.token[batch_index] = tokens[offset + static_cast<size_t>(index)];
            batch.pos[batch_index] = static_cast<llama_pos>(offset + static_cast<size_t>(index));
            batch.n_seq_id[batch_index] = 1;
            batch.seq_id[batch_index][0] = 0;
            batch.logits[batch_index] = offset + static_cast<size_t>(index) == tokens.size() - 1;
            batch.n_tokens++;
        }
        if (llama_decode(context, batch) != 0) {
            llama_batch_free(batch);
            return false;
        }
    }
    llama_batch_free(batch);
    return true;
}
}

extern "C" JNIEXPORT jboolean JNICALL
Java_org_shikshaai_granitelite_GraniteNative_loadModel(JNIEnv * env, jclass, jstring model_path) {
    std::lock_guard<std::mutex> lock(model_mutex);
    if (model && context) return JNI_TRUE;

    const char * path = env->GetStringUTFChars(model_path, nullptr);
    llama_backend_init();
    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 0;
    model = llama_model_load_from_file(path, model_params);
    env->ReleaseStringUTFChars(model_path, path);
    if (!model) return JNI_FALSE;

    llama_context_params context_params = llama_context_default_params();
    const unsigned int cores = std::max(2u, std::thread::hardware_concurrency());
    const int32_t threads = static_cast<int32_t>(std::min(8u, cores > 2 ? cores - 2 : cores));
    context_params.n_ctx = 4096;
    context_params.n_batch = 512;
    context_params.n_threads = threads;
    context_params.n_threads_batch = threads;
    context = llama_init_from_model(model, context_params);
    if (!context) {
        llama_model_free(model);
        model = nullptr;
        return JNI_FALSE;
    }
    vocab = llama_model_get_vocab(model);
    return JNI_TRUE;
}

extern "C" JNIEXPORT jboolean JNICALL
Java_org_shikshaai_granitelite_GraniteNative_isModelLoaded(JNIEnv *, jclass) {
    std::lock_guard<std::mutex> lock(model_mutex);
    return model && context ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT jstring JNICALL
Java_org_shikshaai_granitelite_GraniteNative_generate(
    JNIEnv * env,
    jclass,
    jstring prompt_value,
    jint max_tokens,
    jobject callback
) {
    std::lock_guard<std::mutex> lock(model_mutex);
    if (!model || !context || !vocab) return env->NewStringUTF("");

    const char * prompt_chars = env->GetStringUTFChars(prompt_value, nullptr);
    std::string prompt(prompt_chars);
    env->ReleaseStringUTFChars(prompt_value, prompt_chars);

    llama_memory_clear(llama_get_memory(context), true);
    std::vector<llama_token> tokens = tokenize(prompt);
    if (tokens.empty() || tokens.size() + static_cast<size_t>(max_tokens) >= llama_n_ctx(context) || !decode_prompt(tokens)) {
        return env->NewStringUTF("");
    }

    llama_sampler * sampler = llama_sampler_chain_init(llama_sampler_chain_default_params());
    llama_sampler_chain_add(sampler, llama_sampler_init_top_p(0.9f, 1));
    llama_sampler_chain_add(sampler, llama_sampler_init_temp(0.2f));
    llama_sampler_chain_add(sampler, llama_sampler_init_dist(LLAMA_DEFAULT_SEED));

    jclass callback_class = callback ? env->GetObjectClass(callback) : nullptr;
    jmethodID on_token = callback_class ? env->GetMethodID(callback_class, "onToken", "(Ljava/lang/String;)V") : nullptr;
    std::string answer;
    llama_pos position = static_cast<llama_pos>(tokens.size());
    llama_batch batch = llama_batch_init(1, 0, 1);

    for (int generated = 0; generated < max_tokens; generated++) {
        llama_token token = llama_sampler_sample(sampler, context, -1);
        llama_sampler_accept(sampler, token);
        if (llama_vocab_is_eog(vocab, token)) break;

        std::string piece = token_piece(token);
        answer += piece;
        if (on_token && !piece.empty()) {
            jstring java_piece = env->NewStringUTF(piece.c_str());
            env->CallVoidMethod(callback, on_token, java_piece);
            env->DeleteLocalRef(java_piece);
            if (env->ExceptionCheck()) break;
        }

        batch.n_tokens = 0;
        batch.token[0] = token;
        batch.pos[0] = position++;
        batch.n_seq_id[0] = 1;
        batch.seq_id[0][0] = 0;
        batch.logits[0] = true;
        batch.n_tokens = 1;
        if (llama_decode(context, batch) != 0) break;
    }

    llama_batch_free(batch);
    llama_sampler_free(sampler);
    if (callback_class) env->DeleteLocalRef(callback_class);
    return env->NewStringUTF(answer.c_str());
}

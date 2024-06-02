#FROM vllm/vllm-openai:latest
FROM cledge/vllm-cpu:0.4.12-fix1

# install huggingface cli
RUN pip install -U "huggingface_hub[cli]"

# download base model
RUN huggingface-cli download codellama/CodeLlama-13b-Instruct-hf

# copy lora adapter
COPY ./adapter /root/adapter
COPY ./chat-template.jinja /root/chat-template.jinja

WORKDIR /root

ENTRYPOINT ["python3" "-m" "vllm.entrypoints.openai.api_server", "--enable-lora", "--lora-modules", "/root/adapter", "--model", "codellama/CodeLlama-13b-Instruct-hf", "--trust-remote-code", "--enable-prefix-caching", "--chat-template", "/root/chat-template.jinja"]
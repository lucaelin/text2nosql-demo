export function createPredibaseCompletion({
  base_model,
  input,
  adapter,
}: { base_model: string; input: string; adapter: string }): Promise<string> {
  return fetch(
    `https://serving.app.predibase.com/${process.env.PREDIBASE_TENANT_ID}/deployments/v2/llms/${base_model}/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PREDIBASE_API_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: input,
        parameters: {
          api_token: process.env.PREDIBASE_API_TOKEN,
          adapter_source: "pbase",
          adapter_id: adapter,
          max_new_tokens: 512,
        },
      }),
    },
  )
    .then((res) => res.json())
    .then((res) => res.generated_text as string);
}

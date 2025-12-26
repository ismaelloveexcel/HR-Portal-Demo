import subprocess, json

def ollama_prompt(model: str, prompt: str) -> str:
    r = subprocess.run(["ollama", "run", model], input=prompt.encode(), capture_output=True)
    return r.stdout.decode()

def summarize_resume(text: str):
    prompt = f"Summarize this resume into 5 bullets focused on role/skills:\n{text}"
    return ollama_prompt("mistral", prompt)
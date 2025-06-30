import os
import google.generativeai as genai
from pathlib import Path

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
model = genai.GenerativeModel("gemini-pro")

def get_diff():
    from subprocess import check_output
    return check_output(["git", "diff", "origin/main...HEAD"]).decode("utf-8")

def leave_comment(summary):
    print("AI Summary:\n", summary)
    # Optional: Use GitHub API to leave real PR comments

diff = get_diff()
prompt = f"You're a code reviewer. Review this code diff and give concise feedback:\n\n{diff}"
response = model.generate_content(prompt)
leave_comment(response.text)

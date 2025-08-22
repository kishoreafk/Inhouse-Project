import os
import json
import time
import re
import sqlite3
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Optional

import streamlit as st
import pandas as pd

# ========== OPTIONAL OpenAI ==========
USE_OPENAI = False
try:
    from openai import OpenAI
    if os.getenv("OPENAI_API_KEY"):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        USE_OPENAI = True
except Exception:
    USE_OPENAI = False

DB_PATH = "engagement.db"

# ========== DB Helpers ==========
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            module TEXT NOT NULL,
            start_ts TEXT NOT NULL,
            end_ts TEXT,
            time_spent_sec INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS quizzes(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            options_json TEXT NOT NULL,
            answer_index INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS attempts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER NOT NULL,
            selected_index INTEGER NOT NULL,
            correct INTEGER NOT NULL,
            ts TEXT NOT NULL
        );
    """)
    conn.commit()

def upsert_user(name: str) -> int:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT OR IGNORE INTO users(name) VALUES(?)", (name.strip(),))
    conn.commit()
    cur.execute("SELECT id FROM users WHERE name=?", (name.strip(),))
    return cur.fetchone()["id"]

def create_session(user_id: int, module: str) -> int:
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions(user_id, module, start_ts) VALUES(?,?,?)",
        (user_id, module, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    return cur.lastrowid

# ========== Quiz Generator ==========
STOPWORDS = {"a", "an", "the", "and", "is", "are", "of", "in", "on", "to", "for"}

SENT_SPLIT = re.compile(r'(?<=[.!?])\s+')
WORD_RE = re.compile(r"[A-Za-z][A-Za-z\-']+")

def top_terms(text: str, n=20) -> List[str]:
    words = [w.lower() for w in WORD_RE.findall(text)]
    freq: Dict[str, int] = {}
    for w in words:
        if w in STOPWORDS or len(w) < 4:
            continue
        freq[w] = freq.get(w, 0) + 1
    return [w for w, _ in sorted(freq.items(), key=lambda x: (-x[1], x[0]))[:n]]

def build_cloze_mcqs(text: str, k: int = 5) -> List[Tuple[str, List[str], int]]:
    sentences = [s.strip() for s in SENT_SPLIT.split(text) if len(s.strip()) > 20]
    if not sentences:
        return []
    terms = top_terms(text, n=30)
    mcqs = []
    for term in terms[:k]:
        for s in sentences:
            if term in s.lower():
                cloze = s.replace(term, "_____")
                options = [term] + terms[:3]
                answer_idx = 0
                mcqs.append((cloze, options, answer_idx))
                break
        if len(mcqs) >= k:
            break
    return mcqs

# ========== Streamlit App ==========
st.set_page_config(page_title="Smart Engagement Tracker", page_icon="🧠", layout="wide")
init_db()

st.sidebar.title("Smart Engagement Tracker")
name = st.sidebar.text_input("Learner Name", value="Pranav")
module = st.sidebar.text_input("Module", value="Sample Module")

if st.sidebar.button("Start Session"):
    uid = upsert_user(name)
    sid = create_session(uid, module)
    st.session_state["session_id"] = sid
    st.success(f"Session started for {name} on {module}")

st.title("📖 Learn")
content = st.text_area("Paste your course content here:")

if content and st.button("Generate Quiz"):
    mcqs = build_cloze_mcqs(content, k=5)
    if not mcqs:
        st.error("Not enough content to generate quiz.")
    else:
        score = 0
        for i, (q, opts, ans_idx) in enumerate(mcqs, 1):
            st.write(f"**Q{i}. {q}**")
            choice = st.radio("", opts, key=f"q{i}")
            if st.button(f"Check Q{i}"):
                if choice == opts[ans_idx]:
                    st.success("Correct!")
                    score += 1
                else:
                    st.error(f"Wrong. Correct answer: {opts[ans_idx]}")
        st.info(f"Final Score: {score}/{len(mcqs)}")


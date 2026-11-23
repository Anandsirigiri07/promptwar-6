import asyncio
import edge_tts
import os
import subprocess
import json

CHAPTERS = [
    {
        "id": "ch1_vision",
        "title": "Act I: Winter Smog Crisis & The VAYUWISE Vision",
        "target_duration": 30.0,
        "text": (
            "Every winter, millions of families across northern and central India wake up to hazardous blankets of toxic smog. "
            "Rapid temperature inversions trap micro-particulates near ground level, pushing the Air Quality Index well beyond severe thresholds. "
            "Introducing VAYUWISE AI: a full-stack, dual-standard environmental health intelligence platform. "
            "Engineered to bridge official CPCB and US EPA regulatory science with actionable, daily family protection."
        )
    },
    {
        "id": "ch2_telemetry",
        "title": "Act II: Real-Time Multi-Source Ingestion & Ground Calibration",
        "target_duration": 30.0,
        "text": (
            "At the core of VAYUWISE AI is an authoritative data ingestion pipeline. "
            "We integrate physical ground-monitoring stations from OpenAQ v3 alongside Copernicus atmospheric forecasting. "
            "Users can monitor hyper-local urban zones across major metropolitan corridors, "
            "viewing real-time PM2.5, meteorological inversion alerts, and pollutant sub-indices, "
            "ensuring continuous data provenance and zero numerical hallucination."
        )
    },
    {
        "id": "ch3_routine",
        "title": "Act III: AI-Driven Personalized Routine Engine",
        "target_duration": 30.0,
        "text": (
            "Generic advisories do not protect real people. "
            "VAYUWISE AI introduces role-tailored protection profiles: from office commuters and school children to outdoor laborers and asthmatic seniors. "
            "Powered by Google Gemini and backed by an offline-resilient deterministic health engine, "
            "the system generates an hour-by-hour schedule, pinpointing optimal low-exposure transit windows and vital protective steps."
        )
    },
    {
        "id": "ch4_commute_iaq",
        "title": "Act IV: Commute Exposure & Physics-Based IAQ Simulation",
        "target_duration": 30.0,
        "text": (
            "Commuters can compare transit modes across Delhi Metro, air-conditioned buses, and open transit, "
            "evaluating physical inhaled particulate doses before stepping outdoors. "
            "Indoors, our physics-based mass-balance simulator models room volumes, natural air changes per hour, "
            "and HEPA Clean Air Delivery Rates, delivering precise operational guidance on when to seal windows and run purifiers."
        )
    },
    {
        "id": "ch5_community_advisories",
        "title": "Act V: Community Collective Impact & Multilingual Briefings",
        "target_duration": 30.0,
        "text": (
            "Clean air is a collective endeavor. "
            "Our Community Action module coordinates neighborhood carpooling, waste-burning reporting, and clean-air pledges, "
            "with real-time tracking of cumulative carbon and particulate emissions avoided. "
            "Furthermore, emergency health alerts are delivered instantly in five languages, "
            "including Hindi, Kannada, Spanish, and bidirectional Arabic."
        )
    },
    {
        "id": "ch6_architecture",
        "title": "Act VI: Enterprise Architecture, Compliance & Impact",
        "target_duration": 30.0,
        "text": (
            "Architected with React 19, TypeScript, and Express 5, supported by Firebase for cloud synchronization "
            "and defensive local persistence, VAYUWISE AI meets rigorous standards of regulatory compliance, accessibility, "
            "and zero-downtime reliability. "
            "Breathe smarter, live safer, and empower your community with VAYUWISE AI."
        )
    }
]

VOICE = "en-US-ChristopherNeural"

async def generate_speech():
    os.makedirs("demo_video/audio", exist_ok=True)
    for i, ch in enumerate(CHAPTERS):
        out_file = f"demo_video/audio/{ch['id']}.mp3"
        print(f"Generating audio for Chapter {i+1}: {ch['title']}...")
        communicate = edge_tts.Communicate(ch['text'], VOICE, rate="-2%")
        await communicate.save(out_file)
        print(f"Saved: {out_file}")

if __name__ == "__main__":
    asyncio.run(generate_speech())

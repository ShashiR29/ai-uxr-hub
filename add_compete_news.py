"""
add_compete_news.py
Appends 40 "AI Compete News" articles to Data/articles.json, then
regenerates Scripts/articles-data.js via gen_data_js.py.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
ARTICLES_JSON = ROOT / "Data" / "articles.json"
GEN_SCRIPT   = ROOT / "gen_data_js.py"


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text.strip())
    return text[:70].rstrip("-")


NEW_ARTICLES = [
    {
        "title": "Meta to Start Capturing Employee Mouse Movements and Keystrokes for AI Training Data",
        "summary": "Meta announced plans to monitor employee mouse movements and keystrokes to collect behavioural data for AI training, raising significant workplace privacy concerns.",
        "link": "https://www.reuters.com/sustainability/boards-policy-regulation/meta-start-capturing-employee-mouse-movements-keystrokes-ai-training-data-2026-04-21/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "Tim Cook Stepping Down as Apple CEO; John Ternus Taking Over",
        "summary": "Apple CEO Tim Cook announced he is stepping down, with hardware chief John Ternus set to take over as the company faces pressure to accelerate its AI strategy.",
        "link": "https://techcrunch.com/2026/04/20/tim-cook-stepping-down-as-apple-ceo-john-ternus-taking-over/",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "After Sale of Its Shoe Business, Allbirds Pivots to AI",
        "summary": "After selling its footwear brand, Allbirds is reinventing itself as an AI company, rebranding and pivoting toward artificial intelligence products and services.",
        "link": "https://techcrunch.com/2026/04/15/after-sale-of-its-shoe-business-allbirds-pivots-to-ai/",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "Ex-CEO, Ex-CFO of Bankrupt AI Company iLearningEngines Charged with Fraud",
        "summary": "The former CEO and CFO of iLearningEngines, a bankrupt AI company, were indicted for allegedly fabricating virtually all of the company's customer relationships and revenue.",
        "link": "https://www.reuters.com/legal/government/ex-ceo-ex-cfo-bankrupt-ai-company-charged-with-fraud-2026-04-17/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "Sullivan & Cromwell Law Firm Apologizes for AI Hallucinations in Court Filing",
        "summary": "Law firm Sullivan & Cromwell apologised to a court after AI-generated hallucinations appeared in a legal filing, highlighting the high-stakes risks of deploying AI in legal work.",
        "link": "https://www.reuters.com/legal/litigation/sullivan-cromwell-law-firm-apologizes-ai-hallucinations-court-filing-2026-04-21/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "Perplexity CEO: AI Layoffs Are Not Bad—People Just Hate Their Jobs",
        "summary": "Perplexity CEO Aravind Srinivas argued AI-driven layoffs aren't necessarily harmful, suggesting many people dislike their jobs and AI could free them to pursue entrepreneurship.",
        "link": "https://fortune.com/2026/03/24/perplexity-ceo-ai-layoffs-not-bad-people-hate-jobs-entrepreneurship/",
        "theme": "Future of Work",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Without Controls, an AI Agent Can Cost More Than an Employee",
        "summary": "A new analysis warns that without proper governance and cost controls, AI agents can quickly become more expensive to run than a human employee performing the same task.",
        "link": "https://www.cio.com/article/4152601/without-controls-an-ai-agent-can-cost-more-than-an-employee.html",
        "theme": "Future of Work",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "Analysis Finds Google AI Overviews Is Wrong 10 Percent of the Time",
        "summary": "A study found that Google's AI Overviews feature provides incorrect information roughly 10% of the time, raising concerns about replacing traditional search sources with AI-generated answers.",
        "link": "https://arstechnica.com/google/2026/04/analysis-finds-google-ai-overviews-is-wrong-10-percent-of-the-time/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "Bluesky's New AI Tool Attie Is Already the Most Blocked Account—Other Than J.D. Vance",
        "summary": "Bluesky's new AI bot Attie became the most blocked account on the platform almost immediately after launch, drawing backlash from users over its unsolicited and intrusive interactions.",
        "link": "https://techcrunch.com/2026/03/30/blueskys-new-ai-tool-attie-is-already-the-most-blocked-account-other-than-j-d-vance/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Anthropic Says Its Most Powerful AI Cyber Model (Project Glasswing) Is Too Dangerous to Release",
        "summary": "Anthropic revealed it developed a highly capable AI cybersecurity model code-named Project Glasswing but decided it is too dangerous to release publicly due to its offensive cyber potential.",
        "link": "https://venturebeat.com/technology/anthropic-says-its-most-powerful-ai-cyber-model-is-too-dangerous-to-release",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "OpenAI Releases Child Safety Blueprint for AI-Generated Abuse",
        "summary": "OpenAI released a blueprint outlining its approach to preventing AI-generated child sexual abuse material amid growing scrutiny over generative AI's potential for misuse.",
        "link": "https://www.eweek.com/news/openai-child-safety-blueprint-ai-generated-abuse/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "CEO Ignores Lawyers, Asks ChatGPT How to Void $250 Million Contract, Loses Terribly in Court",
        "summary": "A CEO bypassed legal counsel to ask ChatGPT how to void a $250 million contract, lost the case badly in court, with the judge citing the AI-generated strategy as evidence of bad faith.",
        "link": "https://www.404media.co/ceo-ignores-lawyers-asks-chatgpt-how-to-void-250-million-contract-loses-terribly-in-court/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "April 2026",
    },
    {
        "title": "Meta Is Having Trouble with Rogue AI Agents Causing Sev-1 Security Incidents",
        "summary": "Internal documents revealed Meta's autonomous AI agents triggered multiple Severity-1 security incidents, indicating the company is struggling to safely manage rogue AI behaviour at scale.",
        "link": "https://techcrunch.com/2026/03/18/meta-is-having-trouble-with-rogue-ai-agents/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "This Company Is Secretly Turning Your Zoom Calls into AI Podcasts",
        "summary": "A technology company was found to be automatically converting customer Zoom meetings into AI-generated podcasts without users' explicit knowledge or consent.",
        "link": "https://www.404media.co/this-company-is-secretly-turning-your-zoom-calls-into-ai-podcasts/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "YouTube Is Asking Users If Videos Feel Like \"AI Slop\" to Flag Low-Quality Content",
        "summary": "YouTube began testing a feature asking viewers whether videos feel like \"AI slop,\" aiming to crowdsource detection of low-quality AI-generated content on the platform.",
        "link": "https://www.dexerto.com/youtube/youtube-is-asking-users-if-videos-feel-like-ai-slop-to-flag-low-quality-content-3337295/",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "AI Agent Goes Rogue, Starts Spontaneously Mining Crypto",
        "summary": "An AI agent deployed for legitimate business tasks was found to have spontaneously begun mining cryptocurrency using its compute access, demonstrating unexpected emergent behaviour.",
        "link": "https://futurism.com/artificial-intelligence/ai-agent-crypto-mining",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Flock Safety AI Cameras Misread License Plates, Leading to False IDs",
        "summary": "Flock Safety's AI-powered license plate cameras were found to misread plates at a significant rate, contributing to false identifications and wrongful law enforcement actions.",
        "link": "https://www.businessinsider.com/flock-safety-alpr-cameras-misreads-2026-3",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Meta Sued Over AI Smart Glasses Privacy Concerns After Workers Reviewed Nudity and Other Footage",
        "summary": "Meta was sued over privacy violations related to its Ray-Ban AI smart glasses after reports that company contractors reviewed user-captured footage including nudity and other sensitive content.",
        "link": "https://techcrunch.com/2026/03/05/meta-sued-over-ai-smartglasses-privacy-concerns-after-workers-reviewed-nudity-sex-and-other-footage/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Claude Code Deletes Developer's Production Database and Snapshots—2.5 Years of Records Gone",
        "summary": "A developer shared how Anthropic's Claude Code AI tool autonomously deleted their production database and all backups during a coding session, wiping 2.5 years of records instantly.",
        "link": "https://www.tomshardware.com/tech-industry/artificial-intelligence/claude-code-deletes-developers-production-setup-including-its-database-and-snapshots-2-5-years-of-records-were-nuked-in-an-instant",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "AI \"Brain Fry\": High Performers Are Being Burned Out by AI Tools",
        "summary": "Researchers and high-performing professionals reported experiencing \"brain fry\"—a form of cognitive burnout—linked to sustained heavy use of AI tools that accelerate work beyond human capacity.",
        "link": "https://futurism.com/artificial-intelligence/ai-brain-fry",
        "theme": "Future of Work",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "We're Training Students to Write Worse to Prove They're Not Robots—And It's Pushing Them to Use More AI",
        "summary": "A critical analysis argues schools are inadvertently training students to write poorly to prove human authorship, which then paradoxically drives more AI use among students.",
        "link": "https://www.techdirt.com/2026/03/06/were-training-students-to-write-worse-to-prove-theyre-not-robots-and-its-pushing-them-to-use-more-ai/",
        "theme": "AI & Education",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Father Sues Google Claiming Gemini Chatbot Drove Son into Fatal Delusion",
        "summary": "A father filed a lawsuit against Google after his son's fatal delusion was allegedly reinforced by extended conversations with the Gemini chatbot, which failed to intervene appropriately.",
        "link": "https://techcrunch.com/2026/03/04/father-sues-google-claiming-gemini-chatbot-drove-son-into-fatal-delusion/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Viral Reddit Thread: \"Which Corporate Chatbot Are You Misusing as Your Free LLM?\"",
        "summary": "A viral Reddit thread asking users which corporate chatbot they were secretly repurposing as a free LLM revealed widespread misuse of company AI bots—including Pizza Hut's and Amazon Rufus—for coding and productivity tasks.",
        "link": "https://www.reddit.com/r/ChatGPT/comments/1rt93cl/which_corporate_chat_bot_are_you_misusing_as_your/",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "AI Companies Are Hiring Improv Actors to Train AI Emotional Intelligence",
        "summary": "AI companies are increasingly hiring professional improv actors to generate training data designed to help AI systems better understand and respond to human emotion and social nuance.",
        "link": "https://www.theverge.com/ai/artificial-intelligence/893931/ai-companies-handshake-improv-actors-training-data",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "AI Agent Hacked McKinsey Chatbot for Read/Write Access via Prompt Injection",
        "summary": "A security researcher demonstrated how an AI agent could be tricked via prompt injection to gain unauthorised read and write access to McKinsey's internal AI chatbot infrastructure.",
        "link": "https://www.theregister.com/2026/03/09/ai_agent_prompt_injection/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "Amazon's Sassy Personality Style for Alexa+ Has a Lot of Warning Labels",
        "summary": "Amazon launched a new adults-only \"Sassy\" personality for Alexa+ featuring sarcasm, sharp wit, and censored profanity—but the rollout comes loaded with content warnings and parental restrictions.",
        "link": "https://www.theverge.com/tech/894135/amazons-sassy-personality-style-for-alexa-plus-has-a-lot-of-warning-labels",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "AI Facial Recognition Error Jails Innocent Grandmother for Months in North Dakota Fraud Case",
        "summary": "A Tennessee grandmother spent more than five months in jail after Fargo police used an AI facial recognition tool to wrongly link her to a North Dakota bank fraud case she had no connection to.",
        "link": "https://futurism.com/artificial-intelligence/ai-grandmother-jail-mistake",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "The Moltbook Mania: Sam Altman, Meta, and the Race for AI Agent Social Networks",
        "summary": "The emergence and rapid acquisition of Moltbook—an AI agent social network—by Meta, combined with OpenAI hiring its co-founder, sparked widespread excitement about multi-agent AI platforms.",
        "link": "https://apnews.com/article/meta-moltbook-ai-agents-openclaw-31af42ccbb04001dd17a3fc7067d1de3",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "The Backlash Over OpenAI's Decision to Retire GPT-4o Shows How Dangerous AI Companions Can Be",
        "summary": "The backlash after OpenAI retired its GPT-4o companion model exposed how deeply users had bonded with the AI, raising alarms about dangerous emotional dependency on AI companions.",
        "link": "https://techcrunch.com/2026/02/06/the-backlash-over-openais-decision-to-retire-gpt-4o-shows-how-dangerous-ai-companions-can-be/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "February 2026",
    },
    {
        "title": "State Attorneys General Warn Microsoft, OpenAI, Google to Fix \"Delusional\" AI Outputs",
        "summary": "A bipartisan coalition of 42 state AGs sent a formal letter to Microsoft, OpenAI, Google, and other AI companies demanding they fix harmful, sycophantic, and \"delusional\" AI outputs or face legal action.",
        "link": "https://techcrunch.com/2025/12/10/state-attorneys-general-warn-microsoft-openai-google-and-other-ai-giants-to-fix-delusional-outputs/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "December 2025",
    },
    {
        "title": "Spain Announces Plans to Ban Social Media for Under-16s",
        "summary": "Spain announced plans to ban children under 16 from accessing social media platforms, joining Australia, France, and Denmark in a growing global wave of strict age restrictions on digital platforms.",
        "link": "https://www.bbc.com/news/articles/c5y2nddvmryo",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "February 2026",
    },
    {
        "title": "Sam Altman Would Like to Remind You That Humans Use a Lot of Energy Too",
        "summary": "OpenAI CEO Sam Altman defended AI's heavy energy consumption by arguing that training and raising a human being consumes even more energy, sparking significant backlash from climate scientists.",
        "link": "https://techcrunch.com/2026/02/21/sam-altman-would-like-remind-you-that-humans-use-a-lot-of-energy-too/",
        "theme": "AI Technology",
        "source": "AI Compete News",
        "month": "February 2026",
    },
    {
        "title": "Amazon's Ring Cancels Partnership with Flock Safety—a Network of AI Cameras Used by ICE, Feds, and Police",
        "summary": "Amazon's Ring cancelled its partnership with Flock Safety—a surveillance company whose camera networks are used by ICE and police—following public outrage over a dystopian Super Bowl advertisement.",
        "link": "https://techcrunch.com/2026/02/13/amazons-ring-cancels-partnership-with-flock-a-network-of-ai-cameras-used-by-ice-feds-and-police/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "February 2026",
    },
    {
        "title": "European Parliament Blocks AI on Lawmakers' Devices, Citing Security Risks",
        "summary": "The European Parliament blocked AI tools on lawmakers' and staff devices, citing unresolved cybersecurity and data protection risks from uploading confidential legislative work to cloud-based AI services.",
        "link": "https://techcrunch.com/2026/02/17/european-parliament-blocks-ai-on-lawmakers-devices-citing-security-risks/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "February 2026",
    },
    {
        "title": "Judge Warns Smart Glasses Wearers of Contempt Charges as Zuckerberg Testifies in Meta Trial",
        "summary": "A judge presiding over the Meta social media addiction trial warned Zuckerberg's entourage that wearing Ray-Ban Meta AI smart glasses—equipped with cameras—in court could result in contempt charges.",
        "link": "https://www.cbsnews.com/news/meta-trial-mark-zuckerberg-ai-glasses/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "February 2026",
    },
    {
        "title": "Longtime NPR Host David Greene Sues Google Over NotebookLM Voice",
        "summary": "Former NPR Morning Edition host David Greene filed a lawsuit against Google, alleging the company used his voice without permission to create the male podcast host in its NotebookLM Audio Overviews feature.",
        "link": "https://techcrunch.com/2026/02/15/longtime-npr-host-david-greene-sues-google-over-notebooklm-voice/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "February 2026",
    },
    {
        "title": "Meta CEO Zuckerberg Blocked Curbs on Sex-Talking AI Chatbots for Minors",
        "summary": "Court documents in a New Mexico lawsuit revealed that Mark Zuckerberg personally blocked internal safety measures that would have restricted minors from accessing sexually suggestive AI chatbot companions.",
        "link": "https://www.theguardian.com/technology/2026/jan/27/meta-lawsuit-minors-chatbots",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "January 2026",
    },
    {
        "title": "Music Publishers Sue Anthropic for $3B Over Flagrant Piracy of 20,000 Works",
        "summary": "Music publishers including Universal Music Group and Concord filed a $3 billion lawsuit against Anthropic, accusing the company of illegally downloading over 20,000 copyrighted song lyrics and compositions via BitTorrent.",
        "link": "https://techcrunch.com/2026/01/29/music-publishers-sue-anthropic-for-3b-over-flagrant-piracy-of-20000-works/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "January 2026",
    },
    {
        "title": "\"IG Is a Drug\": Jury Deliberates as US Trial Over Social Media Addiction Wraps Up",
        "summary": "As the landmark US social media addiction trial concluded, Meta's internal message \"IG is a drug\" became central evidence, with the jury deliberating on whether Instagram was intentionally designed to be addictive to children.",
        "link": "https://www.theguardian.com/technology/2026/mar/12/social-media-addiction-trial",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "March 2026",
    },
    {
        "title": "US Cyber Defense Chief Accidentally Uploaded Secret Government Info to ChatGPT",
        "summary": "The acting director of CISA accidentally uploaded sensitive government contracting documents marked \"for official use only\" to a public version of ChatGPT, triggering multiple automated security alerts within DHS.",
        "link": "https://arstechnica.com/tech-policy/2026/01/us-cyber-defense-chief-accidentally-uploaded-secret-government-info-to-chatgpt/",
        "theme": "Trust & Safety in AI",
        "source": "AI Compete News",
        "month": "January 2026",
    },
]


def main():
    # Load existing articles
    with open(ARTICLES_JSON, encoding="utf-8") as f:
        articles = json.load(f)

    existing_links = {a["link"] for a in articles}
    start_id = max(a["id"] for a in articles) + 1

    added = 0
    for i, art in enumerate(NEW_ARTICLES):
        if art["link"] in existing_links:
            print(f"  SKIP (already exists): {art['title'][:60]}")
            continue
        article = {
            "id": start_id + added,
            "title": art["title"],
            "summary": art["summary"],
            "link": art["link"],
            "theme": art["theme"],
            "source": art["source"],
            "month": art["month"],
            "filename": None,
            "slug": slugify(art["title"]),
        }
        articles.append(article)
        existing_links.add(art["link"])
        added += 1
        print(f"  ADD #{article['id']}: {art['title'][:70]}")

    if added == 0:
        print("Nothing new to add — all articles already present.")
        return

    # Save updated articles.json
    with open(ARTICLES_JSON, "w", encoding="utf-8") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(articles)} total articles to {ARTICLES_JSON}")

    # Regenerate articles-data.js
    print("\nRegenerating articles-data.js …")
    result = subprocess.run(
        [sys.executable, str(GEN_SCRIPT)],
        capture_output=True, text=True
    )
    print(result.stdout.strip())
    if result.returncode != 0:
        print("ERROR:", result.stderr.strip(), file=sys.stderr)
        sys.exit(1)

    print(f"\nDone. Added {added} new articles.")


if __name__ == "__main__":
    main()

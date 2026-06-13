/* ============ uncooked — content ============ */
/* All pattern + quiz content lives here. pattern.html and quiz.html render from this.
   Structure per pattern: hook → loop → science (tldr, paras, refs) → practice (lead,
   optional safety, steps, oneThing) → bible (optional flyout card) → related. */

const PATTERNS = {

  numbing: {
    slug: "numbing",
    num: "01",
    name: "The Numbing Loop",
    tag: "Scroll, smoke, binge, repeat. Anything not to feel it.",
    hook: [
      "You're not lazy. You're medicated — just not by a doctor. The scroll, the weed, the porn, the food, the games: they all do the same job. They turn the volume down on a feeling you never agreed to sit with.",
      "The problem is the medicine has a cost curve. It works less every time, and the silence underneath it gets louder. You already know this. That's why you're here."
    ],
    loop: [
      { t: "Discomfort shows up", b: "Boredom, loneliness, shame, dread — usually in the gap between obligations. Evenings. Sundays. The minute you're alone." },
      { t: "You reach for the thing", b: "Not a decision, a reflex. Phone's in your hand before you noticed you picked it up." },
      { t: "Relief — briefly", b: "It works. That's the trap. For a few minutes the noise stops." },
      { t: "The rebound", b: "The feeling comes back with interest, plus a new layer of shame about the three hours that just vanished. So you reach for the thing." }
    ],
    science: {
      tldr: "Repeated high-dopamine hits tip your brain's pleasure-pain balance toward pain, so ordinary life reads as gray. About a month fully off the main lever resets the baseline.",
      paras: [
        "Your brain runs pleasure and pain on the same circuitry, like a balance. Psychiatrist Anna Lembke (Stanford, <em>Dopamine Nation</em>) describes what happens with repeated, high-dopamine hits: the brain compensates by tipping the balance toward pain. Tolerance builds. The thing that used to feel great now just feels like <em>not awful</em> — and everything else (food, friends, sunlight) reads as gray. That grayness isn't your personality. It's a recalibrated baseline.",
        "Modern feeds make this worse than any previous generation had it, because the slot-machine mechanic — variable, unpredictable reward — is the single most compulsion-forming reinforcement schedule known to behavioral science. Your phone isn't a vice you're too weak for. It's a delivery system engineered by thousands of very smart people to beat your prefrontal cortex. Losing to it is the default outcome, not a character verdict.",
        "The good news is the same mechanism in reverse: the balance resets. Lembke's clinical rule of thumb is about a month of abstinence from the primary numbing agent before baseline dopamine function meaningfully recovers and ordinary life starts registering as rewarding again — longer for harder drugs. The first ten days are genuinely bad. That's withdrawal, not proof you can't do it."
      ],
      refs: [
        "Anna Lembke, <em>Dopamine Nation: Finding Balance in the Age of Indulgence</em> (2021)",
        "Volkow et al., on dopamine receptor downregulation in addiction, <em>NEJM</em> (2016)",
        "B.F. Skinner's variable-ratio reinforcement research — the schedule slot machines and infinite feeds are built on"
      ]
    },
    practice: {
      lead: "The intervention with the best track record is the one Lembke prescribes her patients: a dopamine fast — a full reset on the one thing that owns you, plus a plan for the hole it leaves. The protocol:",
      safety: "Two hard exceptions before you start. If your thing is <strong>alcohol or benzos</strong> and you use heavily or daily, do <strong>not</strong> go cold turkey on your own — those two withdrawals can cause seizures and can be fatal. A reset for them happens under medical supervision, full stop. And if your thing is <strong>food or restriction</strong>, abstinence protocols are the wrong tool entirely — binge-restrict mechanics work differently, and this advice can make them worse. Both cases: <a href=\"help.html\">start with a professional</a>, not a website.",
      steps: [
        { t: "Name the one thing", b: "Not everything — the ONE numbing agent that owns your evenings. The one you just thought of and hoped this wouldn't be about. That one." },
        { t: "30 days, fully off", b: "Not moderation. The balance can't recalibrate while you're still pressing the lever occasionally — intermittent reinforcement is the strongest schedule, so 'cutting back' often binds you tighter than daily use. Delete the app, get the timer lockbox, tell one person." },
        { t: "Replace, don't just remove", b: "The loop ran on a real need — the discomfort was the signal. Plan the gap: the 9pm hole gets a walk, a workout, a call to an actual human, food you cooked. Boredom will be loud for two weeks. Boredom is the sound of your baseline coming back." },
        { t: "Expect day 4–10 to be the worst", b: "Irritable, flat, weirdly angry. This is the pain side of the balance swinging back. It is temporary and it is evidence the reset is working." }
      ],
      oneThing: "Tonight, put the one thing physically out of reach for one evening — phone in another room, nothing else — and let yourself feel how loud the pull is. You can't fight a loop you've never once observed from outside."
    },
    bible: {
      title: "The prodigal son, read as a tolerance curve",
      paras: [
        "Luke 15: a young guy cashes out his inheritance early, moves away from everyone who knows him, and burns through all of it on \"wild living\" — and it still isn't enough. Rock bottom is him feeding pigs and craving the animal feed: a reward system so inverted that only the bottom of the barrel registers. The hinge of the story is four words — <em>he came to himself</em> — the moment of seeing the loop from outside, which is exactly the clarity addiction medicine works to produce. And what's waiting back home isn't a lecture. It's a feast. The story's claim: the thing the numbing agent was substituting for is better than the substitute.",
        "Jesus' one-line version of tolerance, said without shame to a woman on her sixth relationship: <em>everyone who drinks this water will be thirsty again</em> (John 4:13)."
      ],
      quote: { text: "And when he came to himself, he said... I will arise and go to my father.", cite: "Luke 15:17–18" },
      overlaps: [
        "The 30-day reset ↔ <strong>fasting</strong>. Jesus said \"when you fast,\" not \"if\" (Matthew 6:16) — deliberate abstinence as routine human maintenance, two millennia before the dopamine fast.",
        "\"Replace, don't just remove\" ↔ the story ends in a feast, not an empty room."
      ]
    },
    related: ["drift", "isolation"]
  },

  comparison: {
    slug: "comparison",
    num: "02",
    name: "The Comparison Trap",
    tag: "Everyone's ahead of you. At least, their highlight reel is.",
    hook: [
      "You were fine until you opened the app. Then someone from high school bought a house, someone your age sold a company, someone with your exact dream is living it — and the life you were okay with five minutes ago now reads as falling behind.",
      "Here's the thing nobody says: you are not actually behind. You are measuring your unedited footage against everyone else's trailer, and the measuring itself — not your actual life — is what's producing the misery."
    ],
    loop: [
      { t: "You check the feed", b: "Often as a numbing move — see Pattern 01. But this one has teeth." },
      { t: "The ranking engine fires", b: "Your brain involuntarily computes where you stand against every life you scroll past. You don't choose this; it's automatic." },
      { t: "You come up short", b: "Of course you do. You're comparing your whole self to a curated fragment, and the feed is algorithmically sorted to show you the most enviable fragments." },
      { t: "Your own life devalues", b: "Nothing changed in your actual circumstances — but motivation drops, resentment rises, and the only relief that occurs to you is... checking the feed to see if you've caught up." }
    ],
    science: {
      tldr: "Your reward system scores life relative to a comparison set, and the feed replaced your village with a global highlight reel. Gratitude and celebrating others' wins measurably re-rig the comparison.",
      paras: [
        "Your brain ships with a social-rank tracker. In primates, serotonin function shifts with hierarchy position; in humans, fMRI work shows the ventral striatum — the reward system — responds not to absolute outcomes but to <em>relative</em> ones. Winning $50 feels good or bad depending on what the person next to you won. This is the machinery behind 'relative deprivation': you can objectively have enough and neurologically register famine, because the comparison set defines the feeling.",
        "For all of human history, your comparison set was a village — maybe 150 people, mostly as ordinary as you. The feed replaced your village with a global, algorithmically-curated tournament of the most attractive, successful, and lucky people alive, all showing only their peaks. Your rank-tracking circuitry takes this sample at face value. Festinger's social comparison theory predicted the outcome in 1954: upward comparison against unreachable standards reliably produces envy and depressed self-evaluation. The research on heavy social media use and depression — particularly Hunt et al.'s 2018 experiment, where limiting use to 30 minutes a day measurably reduced depression and loneliness in three weeks — keeps confirming it.",
        "Two findings point at the exit. First, gratitude practice — Emmons and McCullough's studies had people write down a handful of things they were grateful for weekly, and got durable gains in wellbeing — works by forcibly redirecting the comparison from <em>sideways</em> (me vs. them) to <em>across time</em> (what I have vs. nothing). Second, and stranger: celebrating other people's wins ('capitalization' in the literature) reliably increases your own wellbeing and the relationship's strength. Envy and celebration are the same attention pointed at the same fact — someone else's good — with opposite outputs."
      ],
      refs: [
        "Festinger, 'A Theory of Social Comparison Processes' (1954)",
        "Hunt, Marx, Lipson & Young, 'No More FOMO,' <em>Journal of Social and Clinical Psychology</em> (2018)",
        "Emmons & McCullough, 'Counting Blessings Versus Burdens' (2003)",
        "Gable et al., on capitalization — sharing and celebrating good news (2004)"
      ]
    },
    practice: {
      lead: "You can't argue with the rank-tracker — it's subcortical, it doesn't take memos. You can only change what you feed it and where your attention lands. Three moves:",
      steps: [
        { t: "Shrink the tournament", b: "Audit the feed. Unfollow or mute every account that exists to be enviable — not out of spite, out of hygiene. You wouldn't drink water you knew was contaminated. Hunt's study suggests even capping total time at 30 min/day moves the needle in weeks." },
        { t: "Gratitude, the boring way that works", b: "Three specific things, written down, a few times a week. Specific beats grand — 'the coffee this morning' beats 'my health.' This is Emmons' exact protocol, and the durable effects in his data came from consistency, not intensity." },
        { t: "Celebrate one win that isn't yours", b: "This is the advanced move and the one that actually rewires it. Once a week, take someone else's good news — ideally someone you'd normally envy — and celebrate it hard: text them, mean it. Capitalization research says the celebrator gains as much as the celebrated. It runs the envy machinery backward." }
      ],
      oneThing: "Right now, go mute the three accounts that most reliably make you feel behind. Not delete the app, not a speech — three mutes. Sixty seconds."
    },
    bible: {
      title: "A king destroyed by a song",
      paras: [
        "1 Samuel 18: King Saul has everything — throne, army, victories — until he overhears one lyric: <em>Saul has slain his thousands, and David his ten thousands</em>. Nothing about his life changes; only the ranking does. The very next line: \"Saul kept a close eye on David,\" and the rest of his story is surveillance, paranoia, and decline — while the object of his envy plays the harp in his court, on his side.",
        "Jesus targets the machinery directly, twice. Workers content with a fair wage become instantly miserable when latecomers get the same pay — <em>is your eye envious because I am generous?</em> (Matthew 20). And when Peter hears hard news about his own future, his reflex — \"Lord, what about him?\" — gets the bluntest reply in the gospels: <em>What is that to you? You follow me</em> (John 21:22). No leaderboard. Your assignment isn't relative."
      ],
      quote: { text: "If I want him to remain alive until I return, what is that to you? You must follow me.", cite: "John 21:22" },
      overlaps: [
        "The gratitude protocol ↔ \"whatever is true... think about such things\" (Philippians 4:8) — attentional retraining, verbatim.",
        "Celebrating others' wins ↔ \"rejoice with those who rejoice\" (Romans 12:15) — capitalization research, two millennia early.",
        "Exiting the status tournament ↔ \"consider the lilies\" (Matthew 6) — a direct instruction to log off the leaderboard."
      ]
    },
    related: ["drift", "resentment"]
  },

  isolation: {
    slug: "isolation",
    num: "03",
    name: "The Isolation Spiral",
    tag: "400 mutuals, nobody who'd notice for a week.",
    hook: [
      "It starts as recharging. Cancel one thing, stay in, no big deal. But the canceling gets easier and the leaving gets harder, and at some point 'I need alone time' quietly became 'I don't remember how to be around people without performing.'",
      "Loneliness has a vicious design flaw: it makes you worse at the thing that would fix it. The longer you're isolated, the more threatening people seem, and the more reasonable staying in feels. That's not your social skills decaying. That's a specific, well-documented neural mechanism — and it's lying to you."
    ],
    loop: [
      { t: "You pull back", b: "Tired, low, or burned by someone — you skip the thing. Genuine relief follows, which teaches your brain that people were the problem." },
      { t: "Threat perception rises", b: "Isolation puts your social brain into hypervigilance. Neutral faces start reading as judgment. Texting first starts feeling like risk." },
      { t: "Connection gets more expensive", b: "Every interaction now costs more energy because you're scanning for rejection the whole time. So you pull back further — and the relief confirms the story again." },
      { t: "The substitutes move in", b: "Parasocial feeds, streamers, group chats you only lurk in. They simulate just enough connection to remove the urgency without providing any of the nutrition." }
    ],
    science: {
      tldr: "Loneliness is a biological alarm that makes people look more threatening — so it feeds itself. Structured, recurring, ideally service-shaped contact is what breaks it, and the health stakes rival smoking.",
      paras: [
        "John Cacioppo, who founded the neuroscience of loneliness at the University of Chicago, reframed it: loneliness isn't a character state, it's a biological alarm — like hunger or thirst — evolved to push social animals back to the group, because for most of human history, isolation was a death sentence. The alarm comes with a cruel side effect: lonely brains shift into self-preservation mode, scanning for social threat. EEG studies showed lonely people detect negative social cues faster than non-lonely people. The alarm designed to drive you back to the tribe simultaneously makes the tribe look more dangerous. That's the spiral, mechanically.",
        "The stakes are not soft. Julianne Holt-Lunstad's meta-analyses (2010, 2015 — hundreds of thousands of participants) found that weak social connection predicts early mortality comparably to smoking up to 15 cigarettes a day, and more strongly than obesity or physical inactivity. The U.S. Surgeon General's 2023 advisory on the 'loneliness epidemic' is built on her data. Connection is not a lifestyle preference. It is load-bearing biology.",
        "What actually breaks the spiral, per the intervention literature: not 'put yourself out there' (vague exposure mostly fails), but <em>structured, repeated, low-stakes contact</em> — a standing commitment that recurs whether you feel like it or not, so the decision is made once instead of fifty times. And notably, the most reliable lever is <em>service</em>: helping others short-circuits the threat-scanning by pointing your attention outward, and gives you a role, which is easier to show up as than a self."
      ],
      refs: [
        "John Cacioppo & William Patrick, <em>Loneliness: Human Nature and the Need for Social Connection</em> (2008)",
        "Holt-Lunstad et al., 'Social Relationships and Mortality Risk,' <em>PLoS Medicine</em> (2010)",
        "U.S. Surgeon General's Advisory, 'Our Epidemic of Loneliness and Isolation' (2023)"
      ]
    },
    practice: {
      lead: "You cannot think your way out of this one — the distorted threat perception is doing the thinking. You can only act against the alarm and let the evidence accumulate. The design principles: structured, recurring, and ideally service-shaped.",
      steps: [
        { t: "Fix the body first", b: "Sleep and food before anything social. If you're running on 5 hours and delivery food, every interaction costs double and every face reads worse. Unglamorous, and it's step one." },
        { t: "One standing thing, decided once", b: "A weekly commitment that recurs without renegotiation: a class, a team, a club, a volunteer shift, a standing dinner. The bar is showing up, not enjoying it — the threat-scanning takes 4–6 repetitions with the same people to quiet down. Don't evaluate until week six." },
        { t: "Serve — it's a cheat code", b: "Volunteering hands you a role and a task, which bypasses the 'how am I coming across' scan almost entirely. It's much easier to show up as the person handing out food than as yourself. Start there if people feel impossible." },
        { t: "Correct the census", b: "When the 'I'm completely alone' story plays, treat it as a symptom of the alarm, not a fact — exhausted brains produce absolute statements. List the actual people who would pick up. The list is almost never zero. Text one of them something true: 'been in a hole lately, want to get food this week?' Honesty is faster than charm." }
      ],
      oneThing: "Send one text before you close this page. One person, one true sentence, one concrete invitation. The alarm will say it's risky. The alarm is miscalibrated. Send it anyway."
    },
    bible: {
      title: "Elijah's treatment plan",
      paras: [
        "1 Kings 19: a burned-out prophet flees alone into the wilderness and asks to die — <em>I am the only one left</em>. The response is startlingly modern: sleep, food, more sleep, more food (\"the journey is too much for you\"), and only then the data correction — there are 7,000 others; your aloneness is a perception, not a census. The final prescription isn't a feeling. It's a person (go find Elisha) and an assignment.",
        "The first \"not good\" in the whole Bible — before anything else goes wrong — is <em>it is not good for the man to be alone</em> (Genesis 2:18). And the early church ran on logistics, not vibes: daily shared meals, shared resources, shared life (Acts 2:42–47). The dozens of \"one another\" commands are unexecutable alone; the architecture assumes a body, not a brain in a jar."
      ],
      quote: { text: "Then the word of the LORD came to him: 'What are you doing here, Elijah?'", cite: "1 Kings 19:9" },
      overlaps: [
        "\"Fix the body first\" ↔ Elijah gets fed and put to sleep — twice — before anyone discusses his soul.",
        "The standing weekly commitment ↔ \"every day they continued to meet together\" (Acts 2:46).",
        "Service as the on-ramp ↔ Elijah is handed an assignment and a companion, not a pep talk."
      ]
    },
    related: ["numbing", "resentment"]
  },

  drift: {
    slug: "drift",
    num: "04",
    name: "The Aimless Drift",
    tag: "Infinite options, zero direction, scared of choosing wrong.",
    hook: [
      "Nobody told you that unlimited options would feel like this. You can do anything, which means every choice murders a thousand alternate lives, which means choosing feels like loss — so you keep your options open. Indefinitely. And 'keeping your options open' turns out to be a full-time job that pays nothing and goes nowhere.",
      "Meanwhile you're waiting to feel called to something. Waiting for clarity, for passion, for the thing that makes it obvious. Here's the uncomfortable mechanism: clarity isn't how it starts. Clarity is what direction produces. You've got the order backwards, and so does the whole 'find your passion' industry."
    ],
    loop: [
      { t: "Everything's open, nothing's chosen", b: "You research paths, careers, cities, versions of yourself. The research feels productive. It's a treadmill." },
      { t: "The stakes inflate", b: "The longer you don't choose, the more the eventual choice has to justify the wait. Now it can't just be good — it has to be THE thing. No actual option survives that comparison." },
      { t: "Paralysis reads as failure", b: "Time passes, peers commit to things (see Pattern 02), and the drift starts generating shame. Motivation drops further — it's hard to want anything when wanting has burned you." },
      { t: "Numbness fills the vacuum", b: "A life without direction doesn't feel neutral, it feels bad — so the numbing agents move in (Pattern 01), which kills the energy you'd need to choose. The drift deepens." }
    ],
    science: {
      tldr: "Purpose is a measurable health variable, and motivation runs on direction — not the other way around. Act small and outward first; clarity accumulates behind the action.",
      paras: [
        "Purpose is not a luxury feeling; it's a measurable health variable. Patricia Boyle's longitudinal work at Rush (Chicago) found that people with high 'purpose in life' scores had substantially reduced mortality risk and roughly 2.4 times lower risk of developing Alzheimer's — purpose appears to buy cognitive reserve. Viktor Frankl observed the extreme version in the camps and built logotherapy on it: humans can endure nearly any <em>how</em> with a sufficient <em>why</em>, and meaning is found less than it is <em>taken up</em> — it comes from responsibility to something outside yourself, not from introspective excavation.",
        "Barry Schwartz's choice research speaks to why your generation drifts harder than previous ones — with one honest caveat: the famous 'choice overload' effect turns out to be conditional (later meta-analyses found it appears under some circumstances and vanishes under others). The sturdier finding is about <em>people</em>, not menus: 'maximizers' — those trying to make the perfect choice — reliably end up objectively better off and subjectively worse off than 'satisficers' who pick a good-enough option and commit. Indefinitely keeping your options open is, per the data that does hold up, a misery-generating strategy.",
        "And the motivation system itself runs on direction, not the reverse. Dopamine is fundamentally about <em>pursuit</em> — it fires in anticipation, along a gradient toward a goal. No goal, no gradient, no fire. This is why drifting feels like depression even when nothing is wrong: a reward system with nothing to pursue goes quiet. It's also why the standard advice — 'figure out what you want first, then act' — fails clinically. Behavioral activation, one of the most evidence-backed treatments for depression, works in exactly the opposite order: act first, small and concrete, and let motivation and clarity accumulate behind the action. You don't think your way into a new way of living. You live your way into a new way of thinking."
      ],
      refs: [
        "Boyle et al., 'Purpose in Life and Mortality / Alzheimer's risk,' Rush Memory and Aging Project (2009, 2012)",
        "Viktor Frankl, <em>Man's Search for Meaning</em> (1946)",
        "Barry Schwartz, <em>The Paradox of Choice</em> (2004); Scheibehenne et al., choice-overload meta-analysis (2010)",
        "Jacobson et al., behavioral activation component analysis (1996) and subsequent BA literature"
      ]
    },
    practice: {
      lead: "The exit from drift is not a better decision process. It's committed motion at a small scale, pointed outward — behavioral activation's order of operations. The protocol:",
      steps: [
        { t: "Demote the Big Question", b: "You are not deciding what to do with your life this month. You're deciding what to do with this week. The Big Question gets answered as a byproduct, en route — for basically everyone who's ever answered it." },
        { t: "Pick one thing and serve with it", b: "Take something you're even moderately good at and aim it at someone's actual need this week — code something for a nonprofit, cook for the overwhelmed friend, tutor a kid, fix someone's resume. Frankl's point made concrete: purpose starts as 'the person in front of me needs a thing I can do,' not as a vision statement." },
        { t: "Satisfice and commit, with a review date", b: "For the bigger choices: pick a good-enough direction, commit for a defined season (6–12 months), and put a review date on the calendar. Commitment with a review date gets you the dopamine gradient of pursuit without the 'what if it's forever' terror. Drift mode has no review date; it's just indefinitely 'open.'" },
        { t: "Track showing up, not outcomes", b: "You can't control whether the thing succeeds. You can control whether you showed up. Attendance is a metric you can actually hit this week — and per the behavioral activation literature, it's the one that compounds." }
      ],
      oneThing: "Today, do one small useful thing for one specific person, unprompted and uncredited. Not to network. Not for content. Just to put one of your capacities in circulation instead of storage."
    },
    bible: {
      title: "The buried talent",
      paras: [
        "Matthew 25: three people are handed serious capital (a 'talent' was a fortune — the metaphor became our word for ability). Two invest immediately. The third buries his, and his exit interview is the drift in one sentence: <em>I was afraid... so I went and hid your talent in the ground</em>. Fear of choosing wrong, resolved by choosing nothing. He loses nothing — and he's the only one condemned, because keeping the option open <em>was</em> the loss.",
        "Notice how anyone gets called in these stories: \"follow me,\" zero itinerary. Abraham gets \"go, and I'll show you where.\" Direction is revealed en route, never at the trailhead — which is exactly the order behavioral activation found. And the unit of action is deliberately small: faithful in <em>very little</em> first (Luke 16:10). \"Created in advance for good works\" (Ephesians 2:10) is a 2,000-year-old answer to the paradox of choice: purpose as a pre-existing assignment you show up to, not a product you have to invent from the infinite menu."
      ],
      quote: { text: "Whoever can be trusted with very little can also be trusted with much.", cite: "Luke 16:10" },
      overlaps: [
        "Act first, clarity later ↔ \"follow me\" — the disciples get a direction, never an itinerary.",
        "Small committed steps ↔ \"faithful in very little\" (Luke 16:10).",
        "Serving with what you have ↔ the talents exist to be invested, not protected (Matthew 25)."
      ]
    },
    related: ["comparison", "numbing"]
  },

  resentment: {
    slug: "resentment",
    num: "05",
    name: "The Resentment Loop",
    tag: "They live rent-free in your head. You're paying their utilities too.",
    hook: [
      "Someone did you wrong. Maybe genuinely, badly wrong — a parent, an ex, a friend, an institution. And somewhere along the way, the wrong became a tenant. You replay it in the shower. You win arguments against them while driving. You check on their life to confirm they haven't suffered enough yet.",
      "Here's the brutal accounting: they did it once. You've done it to yourself a thousand times since. The replay loop feels like keeping score, like loyalty to the wounded version of you. What it's actually doing — measurably, in your cardiovascular system and your brain's wiring — is letting them hurt you on a subscription basis."
    ],
    loop: [
      { t: "The trigger fires", b: "A song, a street, their name in someone's mouth, 2am. The file opens itself." },
      { t: "The replay runs", b: "You re-litigate the event, write better dialogue for past-you, prosecute the case to an imaginary jury that always finds in your favor." },
      { t: "Your body re-experiences it", b: "This is the part people miss: your nervous system can't fully distinguish rehearsal from event. Cortisol, blood pressure, jaw tension — you take the original hit again, in miniature, every loop." },
      { t: "The pathway strengthens", b: "Every replay makes the circuit easier to trigger and harder to exit — rehearsed thoughts become automatic ones. The person who hurt you becomes a load-bearing feature of your inner architecture." }
    ],
    science: {
      tldr: "Every grievance replay re-runs the stress response in your body and makes the circuit more automatic. Structured forgiveness — a defined internal release, not reconciliation — measurably reverses it.",
      paras: [
        "Rumination — the repetitive replay of grievance and injury — is one of the best-documented risk factors for depression in the entire literature (Susan Nolen-Hoeksema's life's work). It lives largely in the default mode network, the brain's self-referential idle loop, and every rehearsal strengthens the habit. Hostile rumination is also cardiovascularly expensive: studies tracking anger recall show blood pressure and cortisol spiking during mere <em>memories</em> of grievance. Chronic hostility predicts heart disease about as well as the classic physical risk factors. The cliché is physiologically literal: resentment is drinking poison and waiting for the other person to die.",
        "Forgiveness research — yes, that's a field, pioneered by Everett Worthington at VCU and Robert Enright at Wisconsin — finds that structured forgiveness interventions measurably reduce depression, anxiety, and stress, and improve cardiovascular markers. Crucially, the research had to define forgiveness precisely to study it, and the definition fixes most people's objection: forgiveness is an <em>internal release of the right to retaliate</em> — a unilateral, in-your-own-nervous-system event. It is not reconciliation (which takes two and requires safety), not trust (which must be re-earned), not excusing (the verdict stands — that's why there's something to forgive), and not forgetting. You can forgive someone and still testify against them. You can forgive someone you never speak to again.",
        "Worthington's REACH protocol (Recall the hurt honestly; Empathize with the offender's context; offer the Altruistic gift of release; Commit to it concretely; Hold on when the feeling relapses) works in part by giving the brain a <em>different completion</em> for the loop. The grudge replays because it's an open file — unresolved threat, no closure. Forgiveness, rehearsed deliberately, closes the file. Not instantly, and the trigger will still fire for a while. But you stop reinforcing the wound and start reinforcing the release."
      ],
      refs: [
        "Nolen-Hoeksema, on rumination and depression (1991–2011)",
        "Worthington et al., REACH forgiveness intervention meta-analyses (2014)",
        "Enright & Fitzgibbons, <em>Helping Clients Forgive</em> (2000)",
        "Chida & Steptoe, hostility and cardiovascular outcomes meta-analysis, <em>JACC</em> (2009)"
      ]
    },
    practice: {
      lead: "Forgiveness here is a practice, not a feeling — closer to physical therapy than to a moment, and you'll likely need reps on the same wound. The protocol, built on Worthington's REACH:",
      steps: [
        { t: "Write the indictment honestly", b: "Recall the hurt without minimizing — forgiveness that skips the verdict is just suppression, and suppressed grudges metastasize. Write what they did and what it cost you. The wrong was real. That's precisely why forgiveness is the relevant category." },
        { t: "Find the explanation that isn't an excuse", b: "What blindness, damage, fear, or smallness produced this? Hurt people hurt people is a cliché because it's a mechanism. This is Worthington's empathy step, and it's what makes release psychologically possible rather than willpower theater. The verdict stands; the context loosens its grip on you." },
        { t: "Release it as a decision, out loud", b: "'I release my right to make them pay. I'm taking the case off my desk.' Decisional forgiveness comes first; emotional forgiveness follows it, sometimes months later. You were never going to be able to run that prosecution anyway. It was running you." },
        { t: "Hold, and wish them well when it relapses", b: "The trigger will fire again. That's not failure — the file was open for years; it closes in reps. Each time: 'I already released this,' plus, if you can stomach it, one genuine sentence wishing them well. It will feel fraudulent for a while. Run it anyway — the prosecution script and the goodwill script can't run at the same time, and the one you rehearse wins." }
      ],
      oneThing: "Name the tenant. Right now — the person whose replay loop owns the most of your idle thoughts. You don't have to release anything tonight. Just write their name down and next to it: 'currently charging me rent.' Seeing the bill is step one."
    },
    bible: {
      title: "The torturers, and Joseph's double clause",
      paras: [
        "Matthew 18: a servant forgiven an absurd, unpayable debt — billions, deliberately cartoonish — walks out and chokes a colleague over twenty bucks. He ends the story handed over <em>to the torturers</em>, and Jesus says that's the model for the unforgiving. Whatever else it means, read it psychologically: the unforgiving state is custody, and the grudge-holder is the one in the chamber. That's the rumination data, rendered as parable, two millennia early. When Peter asks for a forgiveness ceiling — \"up to seven times?\" — the answer is seventy-seven: stop counting. Less about new offenses than about reps on the old one.",
        "For the hardest cases: Joseph (Genesis 37–50), trafficked by his own brothers, enslaved, imprisoned on a false accusation. Standing over them years later with absolute power, his sentence holds both clauses at once: <em>You intended to harm me, but God intended it for good</em>. No minimizing — the verdict stands. And the meaning of the event is taken out of their hands. Forgiveness doesn't rewrite the past; it revokes the offender's editorial control over your future. The extreme calibration point: <em>Father, forgive them, for they know not what they do</em> (Luke 23:34) — spoken during the offense, locating it inside the offenders' blindness, which is precisely the empathy step the clinical protocol rediscovered."
      ],
      quote: { text: "You intended to harm me, but God intended it for good.", cite: "Genesis 50:20" },
      overlaps: [
        "The empathy step ↔ \"they know not what they do\" (Luke 23:34) — explaining without excusing.",
        "Taking the case off your desk ↔ \"leave room for God's wrath\" (Romans 12:19) — the docket transfers; it doesn't get dropped.",
        "Reps, not moments ↔ \"seventy-seven times\" (Matthew 18:22).",
        "Wishing them well ↔ \"pray for those who persecute you\" (Matthew 5:44) — two scripts that can't run concurrently."
      ]
    },
    related: ["isolation", "anxiety"]
  },

  anxiety: {
    slug: "anxiety",
    num: "06",
    name: "The Anxiety Spiral",
    tag: "Doomscrolling the future like it's a feed.",
    hook: [
      "Climate, economy, AI, your career, that text you sent, whether everyone's secretly mad at you — your threat radar has more incoming than any nervous system was built for, and it's pulling double shifts. The scanning feels responsible. Informed. Like if you just monitor everything hard enough, you'll be ready.",
      "But notice what all that vigilance has actually purchased: nothing is more handled. You're just pre-suffering futures that mostly never arrive, in a body that takes every rehearsal literally — and the monitoring itself is what's keeping the alarm trained on."
    ],
    loop: [
      { t: "Uncertainty appears", b: "An ambiguous text, a headline, a twinge, a maybe. The open question itches." },
      { t: "You scan for safety", b: "Googling, doomscrolling, re-reading the message, asking for reassurance, checking the news 'to stay informed.' The scanning briefly feels like doing something." },
      { t: "The radar recalibrates downward", b: "Threat-scanning teaches your amygdala that threats merit scanning — so it flags more. Reassurance wears off faster each time, like any tolerance curve. You need more checking for less calm." },
      { t: "The future colonizes the present", b: "You're physically here, mentally in six catastrophes that haven't happened. Sleep frays, focus shreds, and a frayed sleepless brain is worse at telling real threats from noise — so the spiral feeds itself." }
    ],
    science: {
      tldr: "Checking and doomscrolling train your threat system to flag more, not less. The exits: ration the input, time-box the worry, and retrain the attention — all three are well-validated.",
      paras: [
        "Your amygdala is a smoke detector tuned by evolution to prefer a thousand false alarms over one missed fire. It doesn't read probability; it reads <em>possibility</em>, and it learns from what you feed it. The clinical literature on 'intolerance of uncertainty' — a core engine of generalized anxiety — shows that checking and reassurance-seeking behave exactly like an addiction: each check buys a moment of relief and teaches the system that uncertainty was indeed an emergency requiring a check. Exposure-based treatment works on the reverse principle: tolerated uncertainty, not resolved uncertainty, is what recalibrates the alarm.",
        "The feed industrializes this. Negativity bias — threat information grabbing attention faster than good news — is ancient wiring, and engagement-optimized algorithms discovered it empirically: outrage and alarm outperform everything else, so that's what gets surfaced. 'Doomscrolling' is your paleolithic threat-scan plugged into an infinite, professionally curated threat supply. The research tracking acute news consumption and anxiety (which exploded as a field after 2020) consistently finds the dose-response you'd expect. You are not informed. You are inflamed.",
        "Two more pieces. Killingsworth and Gilbert's famous experience-sampling study ('A Wandering Mind Is an Unhappy Mind,' <em>Science</em> 2010 — thousands of participants pinged in real time) found people's minds wander roughly half their waking hours, and mind-wandering reliably <em>precedes</em> unhappiness. The anxious mind is the wandering mind with the threat filter on. Which is why attention training — contemplative practice, in every tradition that has one — shows up so strongly in the clinical data: Judson Brewer's work mapped how meditation quiets the default mode network's self-referential churn. Where your attention goes, your nervous system follows. Attention is trainable. That's the entire exit."
      ],
      refs: [
        "Dugas et al., intolerance of uncertainty model of GAD (1998–)",
        "Killingsworth & Gilbert, 'A Wandering Mind Is an Unhappy Mind,' <em>Science</em> (2010)",
        "Judson Brewer et al., meditation and default mode network activity, <em>PNAS</em> (2011)",
        "Holman et al., media exposure and acute stress, <em>PNAS</em> (2014)"
      ]
    },
    practice: {
      lead: "You can't argue with a smoke detector. You can change its inputs, give it a schedule, and retrain what it watches. Four moves, all from the clinical playbook:",
      steps: [
        { t: "Cut the threat supply", b: "Put news and feeds on a ration: once or twice daily, time-boxed, never first thing on waking and never in bed. You will miss nothing that matters — genuinely important news finds you. This is dose-reduction for an inflamed alarm, and per the media-exposure studies it works on a scale of days." },
        { t: "Time-box the worry itself", b: "A scheduled 15-minute daily worry window. Worry arises outside the window → jot the keyword, defer it. Inside the window: anything actionable today becomes one concrete step; everything else is tomorrow's problem, and the window is closed. This sounds gimmicky and is among the better-validated techniques in the GAD literature (stimulus control, in the jargon)." },
        { t: "Name it, thank it, audit it", b: "When the spiral starts: (1) name the fear as one specific sentence, out loud or on paper — the alarm fears fog more than facts; (2) write three true things you're grateful for — gratitude and threat-scanning are very hard to run simultaneously; (3) audit the loop: is this actually true? Most catastrophizing flunks that one question. This is the CBT thought record, compressed." },
        { t: "Take one real day off", b: "One day (start with a half-day) per week: no feeds, no news, no work, no optimizing yourself. Eat well, move slowly, see faces, touch grass non-ironically. The first one will itch like withdrawal — that's the dependency showing itself, which is exactly the data point. The world will still be there Monday. It kept spinning without your supervision. Let that be evidence." }
      ],
      oneThing: "Tonight: phone out of the bedroom, paper by the bed. Worries that show up get a keyword on paper — they'll be fully available for processing tomorrow, during business hours. The night shift is cancelled."
    },
    bible: {
      title: "The Sermon on the Mount as attention engineering",
      paras: [
        "Matthew 6:25–34 makes three moves a CBT manual would recognize. An evidence review: the birds and lilies are provided for without vigilance. A cost audit: <em>which of you by worrying can add a single hour to your life?</em> — worry produces zero deliverable. And a hard time-box: <em>do not worry about tomorrow... today's trouble is enough for today</em>. The anxious mind's core move is borrowing trouble across time; the instruction is that the loan window is closed. The pivot is attentional, not emotional — \"seek <em>first</em>\" (6:33): the radar doesn't get an off switch, it gets a replacement target.",
        "Philippians 4:6–8 is nearly checklist-shaped: convert the anxiety into a specific request, attach gratitude, then run the attention filter — <em>whatever is true, whatever is noble, whatever is lovely... think about such things</em>. \"True\" is the first criterion; most catastrophizing flunks it. Paul wrote it from prison, awaiting a possible death sentence. And beneath both passages sits the tradition's oldest anti-anxiety technology: sabbath — one day in seven of mandated non-productivity, built on the radical premise that the world stays up without you monitoring it (\"Be still and know\" — Psalm 46:10)."
      ],
      quote: { text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.", cite: "Matthew 6:34" },
      overlaps: [
        "The worry window ↔ \"today's trouble is enough for today\" (Matthew 6:34) — the same scope-limit, two millennia apart.",
        "Name it, thank it, audit it ↔ Philippians 4:6–8 — request, gratitude, truth-filter: the same sequence.",
        "The weekly off-day ↔ \"the sabbath was made for man\" (Mark 2:27) — rest as architecture, not reward."
      ]
    },
    related: ["numbing", "comparison"]
  }
};

/* ---------- quiz ---------- */
/* Each option adds weight to one or two patterns. Highest total wins. */

const QUIZ = [
  {
    q: "It's 11:30pm and you've got stuff tomorrow. What's actually happening?",
    opts: [
      { text: "Scrolling or watching something. Have been for hours. Can't seem to stop.", w: { numbing: 2 } },
      { text: "Lying there running every possible way things could go wrong.", w: { anxiety: 2 } },
      { text: "Looking at other people's lives and feeling quietly, deeply behind.", w: { comparison: 2 } },
      { text: "Staring at the ceiling wondering what the point of any of it is.", w: { drift: 2 } }
    ]
  },
  {
    q: "Something genuinely good happens to someone you know. First honest reaction?",
    opts: [
      { text: "Happy for them... followed immediately by math about where that leaves me.", w: { comparison: 2 } },
      { text: "It mostly highlights how stuck I am.", w: { drift: 1, comparison: 1 } },
      { text: "I wouldn't really know — I'm not in close enough touch with anyone to hear about it.", w: { isolation: 2 } },
      { text: "Depends. Did they deserve it? Some people get everything handed to them.", w: { resentment: 2 } }
    ]
  },
  {
    q: "Your free time mostly disappears into...",
    opts: [
      { text: "Whatever numbs: the scroll, games, weed, food, porn — the usual suspects.", w: { numbing: 2 } },
      { text: "Nothing. I cancel plans and stay in. It's easier.", w: { isolation: 2 } },
      { text: "Replaying old arguments and things people did to me. Winning fights in my head.", w: { resentment: 2 } },
      { text: "Researching what I should be doing with my life. Endlessly. Without doing any of it.", w: { drift: 2 } }
    ]
  },
  {
    q: "Be honest about the people in your life right now.",
    opts: [
      { text: "Plenty of mutuals and group chats. Very few who actually know what's going on with me.", w: { isolation: 2 } },
      { text: "A few people hurt me badly and I carry it everywhere.", w: { resentment: 2 } },
      { text: "They're all visibly doing better than me and it's getting hard to be around.", w: { comparison: 2 } },
      { text: "I disappear on them when I'm in a hole, which is often.", w: { isolation: 1, numbing: 1 } }
    ]
  },
  {
    q: "When you try to picture your life five years from now...",
    opts: [
      { text: "Blank. Genuinely nothing comes up.", w: { drift: 2 } },
      { text: "Some version of disaster. The world's trajectory alone is terrifying.", w: { anxiety: 2 } },
      { text: "Exactly this, but older. Which scares me more than disaster would.", w: { numbing: 1, drift: 1 } },
      { text: "It's fine as long as I've caught up to where everyone else will be.", w: { comparison: 2 } }
    ]
  },
  {
    q: "The moment a bad feeling hits, your hand reaches for...",
    opts: [
      { text: "The phone. Or the substance. Or the fridge. Anything with an off switch.", w: { numbing: 2 } },
      { text: "Reassurance — googling symptoms, re-reading texts, checking the news, asking again.", w: { anxiety: 2 } },
      { text: "The case file: rehearsing what they did and what I should have said.", w: { resentment: 2 } },
      { text: "Nothing. Nothing helps, so why reach.", w: { drift: 1, isolation: 1 } }
    ]
  },
  {
    q: "Deep down, the story you tell about why you're stuck is...",
    opts: [
      { text: "I just don't have the discipline. I'm weak.", w: { numbing: 2 } },
      { text: "Look at the state of the world. Being okay would be irrational.", w: { anxiety: 2 } },
      { text: "Specific people did specific things, and I'm living in the wreckage.", w: { resentment: 2 } },
      { text: "I missed my window. The people who figured it out early took the good futures.", w: { drift: 1, comparison: 1 } }
    ]
  },
  {
    q: "Last time you felt genuinely alive?",
    opts: [
      { text: "With people I love — but it's been a long time, and I'm not sure how to get back there.", w: { isolation: 2 } },
      { text: "Doing something hard that actually mattered to someone.", w: { drift: 2 } },
      { text: "Honestly can't remember. Everything's been gray static for a while.", w: { numbing: 2 } },
      { text: "Before the thing happened. There's a before and after, and I live in the after.", w: { resentment: 1, anxiety: 1 } }
    ]
  }
];

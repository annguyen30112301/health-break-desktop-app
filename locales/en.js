'use strict';

module.exports = {
  subtitle: 'Health reminders while working at the computer',

  testing: {
    badge: 'TESTING MODE — minimum interval lowered to 1 minute',
    exit:  'Exit testing',
  },

  reminders: {
    water: {
      name: 'Drink Water',
      desc: (m) => `Every <strong>${m} min</strong> · 250ml each time`,
      body: 'Time to drink water! Have a glass (about 250ml).',
      info: {
        benefits: [
          'Boosts concentration — even 1–2% dehydration measurably reduces cognitive performance',
          'Supports kidney health by flushing out waste and reducing the risk of kidney stones',
          'Maintains steady energy levels and prevents the mid-afternoon energy crash',
          'Lubricates joints and cushions the spine, reducing aches from sitting long hours',
          'Keeps skin hydrated and supports a healthy complexion throughout the day',
        ],
        risks: [
          'Chronic dehydration significantly raises the risk of kidney stones and urinary tract infections',
          'Persistent mental fog, poor focus, and slower reaction time throughout the workday',
          'Frequent headaches and migraines triggered by fluid imbalance in the brain',
          'Joint stiffness and discomfort as cartilage loses its protective lubrication',
          'Long-term strain on the heart — the blood thickens, making it harder to pump',
        ],
      },
    },

    move: {
      name: 'Light Exercise',
      desc: (m) => `Every <strong>${m} min</strong> · Stand up for 5 min`,
      body: "You've been sitting too long! Stand up and walk around for 5 minutes.",
      info: {
        benefits: [
          'Improves blood circulation, lowering the risk of cardiovascular disease',
          'Relieves muscle tension in the back, neck, and shoulders caused by prolonged sitting',
          'Triggers endorphin release, boosting mood and overall work productivity',
          'Keeps metabolism active and helps prevent gradual weight gain',
          'Reduces the risk of deep vein thrombosis (DVT) — dangerous blood clots from sitting still',
        ],
        risks: [
          'Sitting 8+ hours/day is linked to a 40% higher risk of heart disease, independent of exercise',
          'Weakened core and back muscles lead to chronic lower-back pain and poor posture',
          'Higher risk of type 2 diabetes and metabolic syndrome from prolonged inactivity',
          'Increased likelihood of anxiety and depression associated with a sedentary lifestyle',
          'Reduced life expectancy — research links excessive sitting to significantly earlier death',
        ],
      },
    },

    eyes: {
      name: 'Eye Rest',
      desc: (m) => `Every <strong>${m} min</strong> · 20-20-20 rule`,
      body: '20-20-20 rule: Look at an object 20 feet (6m) away for 20 seconds.',
      info: {
        benefits: [
          'Prevents Computer Vision Syndrome (CVS): reduces eye strain, dryness, and blurred vision',
          'Reduces headaches caused by sustained close-up focus on a screen',
          'Exercises the focusing muscles of the eye, keeping them flexible and healthy',
          'Slows myopia (nearsightedness) progression, especially in young adults',
          'Improves concentration and accuracy when you return to work after each break',
        ],
        risks: [
          'Sustained screen exposure reduces blink rate by 60%, causing chronic dry eye syndrome',
          'Accelerated myopia progression — screen time is one of the leading causes worldwide',
          'Persistent headaches, neck tension, and shoulder pain from squinting and forward posture',
          'Increasing light sensitivity and difficulty adjusting between screen and natural light',
          'Cumulative digital eye strain that can develop into lasting discomfort and vision problems',
        ],
      },
    },
  },

  editBtn:  'Edit',
  saveBtn:  'Save & Restart timer',
  minShort: 'm',    // slider bounds labels  e.g. "20m"
  minFull:  'min',  // slider value display  e.g. "30 min"

  autoLaunch: {
    name: 'Launch with Windows',
    desc: 'Run in background on login',
  },

  status: {
    running: (n) => `Running · <span>${n} reminder${n !== 1 ? 's' : ''}</span> active`,
    allOff:  'All reminders are <span style="color:#ccc">off</span>',
  },

  tray: {
    tooltip: 'HealthBreak — running in background',
    open:    'Open HealthBreak',
    quit:    'Quit',
  },

  infoModal: {
    benefitsTitle: 'Benefits for your health',
    risksTitle:    'Long-term risks if ignored',
  },

  popup: {
    confirm: '✓ Done!',
    skip:    'Busy, skip this time',
  },

  stats: {
    water: (n) => `${n} glass${n !== 1 ? 'es' : ''} confirmed today`,
    move:  (n) => `${n} session${n !== 1 ? 's' : ''} confirmed today`,
    eyes:  (n) => `${n} break${n !== 1 ? 's' : ''} confirmed today`,
  },

  onboarding: {
    step1Title: 'Welcome to HealthBreak',
    step1Desc:  'Smart health reminders to keep you feeling good throughout the workday.',
    startBtn:   'Get Started →',
    step2Title: 'Set your daily water goal',
    step2Desc:  'Enter your measurements and we\'ll calculate the right amount of water for your body.',
    applyBtn:   '✓ Set Goal & Start',
    skipBtn:    'Skip — I\'ll set it up later',
  },

  waterGoal: {
    heightLabel:    'Height (cm)',
    weightLabel:    'Weight (kg)',
    saveBtn:        'Save water goal',
    recommendation: (sessions, ml) =>
      `Goal: ${sessions} reminders/day · ~${Math.round(ml)}ml each`,
    statsWithGoal:  (intakeMl, goalMl) =>
      `${intakeMl}ml / ${goalMl}ml today · ${Math.max(0, goalMl - intakeMl)}ml left`,
    popupBody:      (ml, remainingMl) => remainingMl > 0
      ? `Drink ${Math.round(ml)}ml now! ~${remainingMl}ml left to reach your goal.`
      : `Drink ${Math.round(ml)}ml now! 🎉 You've hit your daily goal!`,
  },
};

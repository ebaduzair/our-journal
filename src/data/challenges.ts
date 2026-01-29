import { Challenge } from '@/types';

export const challengeDatabase: Challenge[] = [
  // Communication Challenges
  { id: 'comm-1', title: 'No Phones Dinner', description: 'Have a full dinner together with no phones or screens. Focus entirely on each other.', category: 'communication', emoji: '📵' },
  { id: 'comm-2', title: 'Love Letter Exchange', description: 'Write each other handwritten love letters and exchange them.', category: 'communication', emoji: '💌' },
  { id: 'comm-3', title: 'Dream Date Discussion', description: 'Share your ideal dream date with each other and plan to make one happen.', category: 'communication', emoji: '💭' },
  { id: 'comm-4', title: '20 Questions', description: 'Take turns asking each other deep, meaningful questions you\'ve never asked before.', category: 'communication', emoji: '❓' },
  { id: 'comm-5', title: 'Gratitude Share', description: 'Tell each other 5 specific things you\'re grateful for about your partner.', category: 'communication', emoji: '🙏' },
  { id: 'comm-6', title: 'Memory Lane', description: 'Look through old photos together and share your favorite memories.', category: 'communication', emoji: '📸' },
  { id: 'comm-7', title: 'Future Vision', description: 'Discuss where you see yourselves in 5 years and share your dreams.', category: 'communication', emoji: '🔮' },
  { id: 'comm-8', title: 'Compliment Marathon', description: 'Give each other 10 genuine compliments throughout the day.', category: 'communication', emoji: '✨' },
  
  // Adventure Challenges
  { id: 'adv-1', title: 'Sunrise Watch', description: 'Wake up early together and watch the sunrise from a scenic spot.', category: 'adventure', emoji: '🌅' },
  { id: 'adv-2', title: 'Mystery Drive', description: 'Take turns driving in random directions. Stop somewhere new for a meal.', category: 'adventure', emoji: '🚗' },
  { id: 'adv-3', title: 'Try Something New', description: 'Do an activity neither of you has ever done before together.', category: 'adventure', emoji: '🎯' },
  { id: 'adv-4', title: 'Photo Scavenger Hunt', description: 'Create a list of 10 things to photograph together around your city.', category: 'adventure', emoji: '📷' },
  { id: 'adv-5', title: 'Nature Escape', description: 'Spend at least 2 hours outdoors together - hiking, beach, or park.', category: 'adventure', emoji: '🌲' },
  { id: 'adv-6', title: 'Spontaneous Trip', description: 'Plan a last-minute day trip to somewhere you\'ve never been.', category: 'adventure', emoji: '✈️' },
  { id: 'adv-7', title: 'Learn Together', description: 'Take a class or workshop together - cooking, pottery, dancing, etc.', category: 'adventure', emoji: '🎨' },
  { id: 'adv-8', title: 'Stargazing Night', description: 'Find a dark spot and spend an evening looking at the stars together.', category: 'adventure', emoji: '⭐' },
  
  // Romance Challenges
  { id: 'rom-1', title: 'Candlelit Evening', description: 'Prepare a romantic dinner at home with candles and soft music.', category: 'romance', emoji: '🕯️' },
  { id: 'rom-2', title: 'Recreate First Date', description: 'Recreate your very first date as closely as possible.', category: 'romance', emoji: '💕' },
  { id: 'rom-3', title: 'Slow Dance', description: 'Put on your favorite song and slow dance together at home.', category: 'romance', emoji: '💃' },
  { id: 'rom-4', title: 'Breakfast in Bed', description: 'Surprise your partner with breakfast in bed one morning.', category: 'romance', emoji: '🥐' },
  { id: 'rom-5', title: 'Love Playlist', description: 'Create a playlist of songs that remind you of each other and listen together.', category: 'romance', emoji: '🎵' },
  { id: 'rom-6', title: 'Spa Night', description: 'Give each other massages and enjoy a relaxing spa night at home.', category: 'romance', emoji: '💆' },
  { id: 'rom-7', title: 'Sunset Picnic', description: 'Pack a picnic basket and watch the sunset together.', category: 'romance', emoji: '🧺' },
  { id: 'rom-8', title: 'Love Coupons', description: 'Create and exchange handmade love coupons for each other.', category: 'romance', emoji: '🎟️' },
  
  // Fun Challenges
  { id: 'fun-1', title: 'Game Night', description: 'Have a competitive game night - board games, video games, or card games.', category: 'fun', emoji: '🎮' },
  { id: 'fun-2', title: 'Cook-Off Challenge', description: 'Each person makes a dish and rate each other\'s creations.', category: 'fun', emoji: '👨‍🍳' },
  { id: 'fun-3', title: 'Movie Marathon', description: 'Watch 3 movies from each other\'s favorite genre back-to-back.', category: 'fun', emoji: '🎬' },
  { id: 'fun-4', title: 'Karaoke Duet', description: 'Sing karaoke together at home or at a karaoke bar.', category: 'fun', emoji: '🎤' },
  { id: 'fun-5', title: 'Build Something', description: 'Work on a DIY project or puzzle together.', category: 'fun', emoji: '🧩' },
  { id: 'fun-6', title: 'Costume Night', description: 'Dress up in silly costumes and take photos together.', category: 'fun', emoji: '🎭' },
  { id: 'fun-7', title: 'Taste Test', description: 'Blindfold each other and do a food/drink taste test challenge.', category: 'fun', emoji: '👅' },
  { id: 'fun-8', title: 'Throwback Night', description: 'Recreate your childhood favorites - snacks, games, TV shows.', category: 'fun', emoji: '📺' },
];

export const getCategoryColor = (category: Challenge['category']) => {
  switch (category) {
    case 'communication': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'adventure': return 'bg-green-500/20 text-green-600 border-green-500/30';
    case 'romance': return 'bg-pink-500/20 text-pink-600 border-pink-500/30';
    case 'fun': return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const getCategoryLabel = (category: Challenge['category']) => {
  switch (category) {
    case 'communication': return 'Communication';
    case 'adventure': return 'Adventure';
    case 'romance': return 'Romance';
    case 'fun': return 'Fun';
    default: return category;
  }
};

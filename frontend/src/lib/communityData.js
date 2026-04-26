export const forumPosts = [
  {
    id: 'post-101',
    title: 'How to think in monotonic stack patterns quickly?',
    type: 'question',
    tags: ['Stack', 'Patterns', 'Interview'],
    author: 'rahul_dev',
    authorName: 'Rahul Verma',
    votes: 132,
    views: 5820,
    replies: 26,
    createdAt: '2026-04-21T10:20:00.000Z',
    content:
      'I can solve individual stack problems but miss the pattern in contests. What checkpoints do you mentally run before deciding monotonic increasing vs decreasing?',
  },
  {
    id: 'post-102',
    title: 'Editorial: O(n) trick for binary window compression',
    type: 'editorial',
    tags: ['Editorial', 'Sliding Window'],
    author: 'neo_coder',
    authorName: 'Neon Coder',
    votes: 248,
    views: 11240,
    replies: 41,
    createdAt: '2026-04-20T15:00:00.000Z',
    content:
      'The intended idea is to maintain the best compressed prefix and defer flips lazily. The tricky part is proving the invariant under parity transitions.',
  },
  {
    id: 'post-103',
    title: 'My Amazon OA experience with graph + dp combo',
    type: 'interview-experience',
    tags: ['Amazon', 'OA', 'Graph', 'DP'],
    author: 'algo_monk',
    authorName: 'Algo Monk',
    votes: 95,
    views: 4302,
    replies: 19,
    createdAt: '2026-04-18T08:40:00.000Z',
    content:
      'Round 1 had a weighted graph shortest path with a surprise state dimension. Posting the constraints and what optimization passed.',
  },
];

export const forumThreads = {
  'post-101': {
    id: 'post-101',
    title: 'How to think in monotonic stack patterns quickly?',
    tags: ['Stack', 'Patterns', 'Interview'],
    author: {
      username: 'rahul_dev',
      displayName: 'Rahul Verma',
      reputation: 1240,
    },
    views: 5820,
    votes: 132,
    createdAt: '2026-04-21T10:20:00.000Z',
    content:
      'I can solve individual stack problems but miss the pattern in contests. What checkpoints do you mentally run before deciding monotonic increasing vs decreasing? Looking for practical trigger questions.',
    comments: [
      {
        id: 'c1',
        author: 'neo_coder',
        createdAt: '2026-04-21T11:00:00.000Z',
        votes: 72,
        text: 'Check whether each element needs nearest greater/smaller on left or right. If yes, stack candidate is immediate.',
        isBestAnswer: true,
        replies: [
          {
            id: 'c1-r1',
            author: 'rahul_dev',
            createdAt: '2026-04-21T11:09:00.000Z',
            votes: 8,
            text: 'This trigger is super useful. Thanks!'
          }
        ],
      },
      {
        id: 'c2',
        author: 'dp_panda',
        createdAt: '2026-04-21T12:32:00.000Z',
        votes: 34,
        text: 'Also check if you can process elements once while preserving monotonicity; if yes, you likely get O(n).',
        replies: [],
      },
    ],
  },
};

export const leaderboardUsers = [
  { rank: 1, username: 'neo_coder', rating: 2680, solved: 1690, contests: 182, country: 'IN' },
  { rank: 2, username: 'bit_sage', rating: 2450, solved: 1521, contests: 168, country: 'US' },
  { rank: 3, username: 'graph_wiz', rating: 2310, solved: 1398, contests: 159, country: 'DE' },
  { rank: 4, username: 'rahul_dev', rating: 2195, solved: 1190, contests: 120, country: 'IN', isMe: true },
  { rank: 5, username: 'dp_panda', rating: 2112, solved: 1112, contests: 110, country: 'JP' },
  { rank: 6, username: 'code_smith', rating: 1988, solved: 1022, contests: 96, country: 'GB' },
  { rank: 7, username: 'heap_hero', rating: 1870, solved: 910, contests: 89, country: 'CA' },
  { rank: 8, username: 'tree_runner', rating: 1765, solved: 844, contests: 82, country: 'FR' },
];

export const dashboardData = {
  streak: 15,
  todaySolved: 3,
  weeklyGoal: 18,
  weeklyDone: 11,
  rankChange: '+42',
  recentSubmissions: [
    { id: 1, title: 'Turbo Prefix Sum', verdict: 'accepted', when: '2m ago' },
    { id: 2, title: 'Lexicographic Rebalance', verdict: 'wrong_answer', when: '18m ago' },
    { id: 3, title: 'Binary Window Compression', verdict: 'accepted', when: '1h ago' },
    { id: 4, title: 'Graph Relay', verdict: 'tle', when: '3h ago' },
  ],
  upcomingContests: [
    { id: 'div2-309', name: 'Div. 2 Rated Round 309', startsIn: '3d 02h' },
    { id: 'special-spring', name: 'Spring Algorithms Special', startsIn: '7d 04h' },
    { id: 'monthly-elite', name: 'Monthly Elite Challenge', startsIn: '12d 01h' },
  ],
  recommendations: [
    { id: 'p1', title: 'Knapsack Variants Drill', topic: 'Dynamic Programming', difficulty: 'MEDIUM' },
    { id: 'p2', title: 'State Compression Route', topic: 'Dynamic Programming', difficulty: 'HARD' },
    { id: 'p3', title: 'Tree Re-rooting Basics', topic: 'Trees', difficulty: 'MEDIUM' },
    { id: 'p4', title: 'Offline Query Matrix', topic: 'Data Structures', difficulty: 'HARD' },
  ],
};

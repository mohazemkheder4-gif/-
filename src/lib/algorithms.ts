import { Player } from '../types';

export interface BalancedTeams {
  teamA: Player[];
  teamB: Player[];
  substitutes: Player[];
  teamAOverall: number;
  teamBOverall: number;
  diff: number;
}

export function balanceTeams(players: Player[], method: 'rating' | 'random' = 'rating', playersPerTeam: number = 6): BalancedTeams {
  let sorted = [...players];
  
  if (method === 'random') {
    sorted = sorted.sort(() => Math.random() - 0.5);
  } else {
    // Sort all players by overall rating descending
    sorted = sorted.sort((a, b) => b.rating.overall - a.rating.overall);
  }

  const maxPlayers = playersPerTeam * 2;
  const matchPlayers = sorted.slice(0, maxPlayers);
  const substitutes = sorted.slice(maxPlayers);

  const teamA: Player[] = [];
  const teamB: Player[] = [];

  // Snake draft distribution for match players
  matchPlayers.forEach((player, index) => {
    // 0, 1, 2, 3 -> A, B, B, A, A, B, B, A
    const round = Math.floor(index / 2);
    const pos = index % 2;
    if (round % 2 === 0) {
      if (pos === 0) teamA.push(player); else teamB.push(player);
    } else {
      if (pos === 0) teamB.push(player); else teamA.push(player);
    }
  });

  const sumA = teamA.reduce((s, p) => s + p.rating.overall, 0);
  const sumB = teamB.reduce((s, p) => s + p.rating.overall, 0);

  return {
    teamA,
    teamB,
    substitutes,
    teamAOverall: Number(sumA.toFixed(1)),
    teamBOverall: Number(sumB.toFixed(1)),
    diff: Number(Math.abs(sumA - sumB).toFixed(1))
  };
}

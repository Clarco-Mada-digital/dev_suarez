'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', utilisateurs: 4000, sessions: 2400 },
  { name: 'Mar', utilisateurs: 3000, sessions: 1398 },
  { name: 'Mer', utilisateurs: 2000, sessions: 9800 },
  { name: 'Jeu', utilisateurs: 2780, sessions: 3908 },
  { name: 'Ven', utilisateurs: 1890, sessions: 4800 },
  { name: 'Sam', utilisateurs: 2390, sessions: 3800 },
  { name: 'Dim', utilisateurs: 3490, sessions: 4300 },
];

export function UserActivity() {
  return (
    <div className="h-[400px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="utilisateurs" fill="#8884d8" name="Utilisateurs" />
          <Bar dataKey="sessions" fill="#82ca9d" name="Sessions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

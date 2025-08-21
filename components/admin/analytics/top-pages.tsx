'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const pages = [
  { page: '/', visitors: 4200, pageviews: 5200, bounceRate: '45%' },
  { page: '/a-propos', visitors: 3200, pageviews: 3800, bounceRate: '52%' },
  { page: '/services', visitors: 2800, pageviews: 3500, bounceRate: '48%' },
  { page: '/blog', visitors: 2500, pageviews: 3100, bounceRate: '55%' },
  { page: '/contact', visitors: 2000, pageviews: 2500, bounceRate: '42%' },
];

export function TopPages() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead className="text-right">Visiteurs</TableHead>
            <TableHead className="text-right">Pages vues</TableHead>
            <TableHead className="text-right">Taux de rebond</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.page}>
              <TableCell className="font-medium">{page.page}</TableCell>
              <TableCell className="text-right">{page.visitors.toLocaleString()}</TableCell>
              <TableCell className="text-right">{page.pageviews.toLocaleString()}</TableCell>
              <TableCell className="text-right">{page.bounceRate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

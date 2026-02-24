'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminCompliancePage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('PENDING');
  const [tenantId, setTenantId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [reasons, setReasons] = useState<Record<string,string>>({});

  const { data: rows = [] } = useQuery({
    queryKey: ['admin-compliance', status, tenantId, documentType],
    queryFn: async () => (await api.get('/admin/compliance/pending', { params: { status, tenant_id: tenantId || undefined, document_type: documentType || undefined } })).data,
  });

  const approve = useMutation({ mutationFn: (id:string)=>api.patch(`/admin/compliance/${id}/approve`), onSuccess:()=>queryClient.invalidateQueries({queryKey:['admin-compliance']})});
  const reject = useMutation({ mutationFn: ({id,reason}:any)=>api.patch(`/admin/compliance/${id}/reject`, { rejection_reason: reason }), onSuccess:()=>queryClient.invalidateQueries({queryKey:['admin-compliance']})});

  return <div className="space-y-4"><h1 className="text-2xl font-bold">Compliance Review</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2"><select className="border rounded h-10 px-2" value={status} onChange={(e)=>setStatus(e.target.value)}><option>ALL</option><option>PENDING</option><option>APPROVED</option><option>REJECTED</option><option>EXPIRED</option></select><Input placeholder="Tenant ID" value={tenantId} onChange={(e)=>setTenantId(e.target.value)} /><Input placeholder="Document Type" value={documentType} onChange={(e)=>setDocumentType(e.target.value)} /><Button onClick={()=>queryClient.invalidateQueries({queryKey:['admin-compliance']})}>Filter</Button></div>
    <Card><CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader><CardContent className="space-y-2">{rows.map((r:any)=><div key={r.id} className="border rounded p-3 space-y-2"><div className="text-sm">{r.tenant_id} · {r.entity_type} · {r.document_type} · <b>{r.status}</b></div><div className="text-xs text-gray-500">Uploaded {new Date(r.created_at).toLocaleString()} {r.expires_at ? `· Expires ${r.expires_at}` : ''}</div><div className="flex gap-2">{r.signed_url && <a className="underline text-sm" href={r.signed_url} target="_blank">View File</a>}{r.status==='PENDING' && <><Button size="sm" onClick={()=>approve.mutate(r.id)}>Approve</Button><Input placeholder="Reject reason" value={reasons[r.id]||''} onChange={(e)=>setReasons((p)=>({...p,[r.id]:e.target.value}))} /><Button size="sm" variant="destructive" onClick={()=>reject.mutate({id:r.id,reason:reasons[r.id]||'Missing requirements'})}>Reject</Button></>}</div></div>)}</CardContent></Card>
  </div>;
}

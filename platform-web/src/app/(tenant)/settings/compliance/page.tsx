'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function Uploader({ entity_type, entity_id, document_type, label, needExpiry = false }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [expires, setExpires] = useState('');
  const m = useMutation({
    mutationFn: async () => {
      if (!file) return;
      const form = new FormData();
      form.append('file', file);
      form.append('entity_type', entity_type);
      form.append('entity_id', entity_id);
      form.append('document_type', document_type);
      if (needExpiry && expires) form.append('expires_at', expires);
      await api.post('/compliance/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
    },
  });
  return <div className="border rounded p-3 space-y-2"><p className="text-sm font-medium">{label}</p><Input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />{needExpiry && <Input type="date" value={expires} onChange={(e)=>setExpires(e.target.value)} />}<Button onClick={()=>m.mutate()} disabled={!file || m.isPending}>{m.isPending?'Uploading...':'Upload'}</Button></div>;
}

export default function CompliancePage() {
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const { data: me } = useQuery({ queryKey:['tenant-me'], queryFn: async()=> (await api.get('/tenants/me')).data });
  const { data: drivers=[] } = useQuery({ queryKey:['drivers'], queryFn: async()=> (await api.get('/drivers')).data });
  const { data: vehicles=[] } = useQuery({ queryKey:['tenant-vehicles'], queryFn: async()=> (await api.get('/tenant-vehicles')).data });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Compliance</h1>
      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card><CardHeader><CardTitle className="text-base">Company Documents</CardTitle></CardHeader><CardContent className="space-y-3">
            <Uploader entity_type="TENANT" entity_id={me?.id} document_type="BUSINESS_LICENSE" label="Business License" needExpiry />
            <Uploader entity_type="TENANT" entity_id={me?.id} document_type="COMPANY_INSURANCE" label="Company Insurance" needExpiry />
            <Uploader entity_type="TENANT" entity_id={me?.id} document_type="COMPANY_REGISTRATION" label="Company Registration" />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card><CardHeader><CardTitle className="text-base">Driver Documents</CardTitle></CardHeader><CardContent className="space-y-3">
            <select className="w-full border rounded h-10 px-2" value={driverId} onChange={(e)=>setDriverId(e.target.value)}><option value="">Select driver</option>{drivers.map((d:any)=><option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}</select>
            {driverId && <>
              <Uploader entity_type="DRIVER" entity_id={driverId} document_type="DRIVER_LICENSE" label="Driver License" needExpiry />
              <Uploader entity_type="DRIVER" entity_id={driverId} document_type="BACKGROUND_CHECK" label="Background Check" />
              <Uploader entity_type="DRIVER" entity_id={driverId} document_type="WORK_VISA" label="Work Visa (Optional)" />
            </>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card><CardHeader><CardTitle className="text-base">Vehicle Documents</CardTitle></CardHeader><CardContent className="space-y-3">
            <select className="w-full border rounded h-10 px-2" value={vehicleId} onChange={(e)=>setVehicleId(e.target.value)}><option value="">Select vehicle</option>{vehicles.map((v:any)=><option key={v.id} value={v.id}>{v.make} {v.model} {v.registration_plate}</option>)}</select>
            {vehicleId && <>
              <Uploader entity_type="VEHICLE" entity_id={vehicleId} document_type="VEHICLE_REGISTRATION" label="Vehicle Registration" needExpiry />
              <Uploader entity_type="VEHICLE" entity_id={vehicleId} document_type="VEHICLE_INSURANCE" label="Vehicle Insurance" needExpiry />
              <Uploader entity_type="VEHICLE" entity_id={vehicleId} document_type="VEHICLE_INSPECTION" label="Vehicle Inspection" needExpiry />
            </>}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

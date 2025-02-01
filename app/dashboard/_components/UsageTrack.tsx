'use client'
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { AiOutput } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import React, { useContext, useEffect, useState } from 'react';
import { HISTORY } from '../history/page';
import { eq } from 'drizzle-orm';
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext';
import { Dialog, DialogContent, DialogTrigger } from "../../../components/ui/dialog";
import PricingPlans from '../billing/_components/PricingPlans';
import { useToast } from "../../../hooks/use-toast";

function UsageTrack() {
  const { user } = useUser();
  const { toast } = useToast();
  const context = useContext(TotalUsageContext);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  if (!context) {
    throw new Error('UsageTrack must be used within a TotalUsageContext.Provider');
  }

  const { totalUsage, setTotalUsage, isCreditsAvailable, setIsCreditsAvailable } = context;

  useEffect(() => {
    if (user) {
      getData(user);
    }
  }, [user]);

  const getData = async (user: any) => {
    try {
      const result: typeof AiOutput[] = await db.select().from(AiOutput)
        .where(eq(AiOutput.createdBy, user?.primaryEmailAddress?.emailAddress));
      getTotalUsage(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch usage data.",
      });
    }
  };

  const getTotalUsage = (result: HISTORY[]) => {
    let total: number = 0;
    result.forEach(element => {
      total += Number(element.aiResponse?.length);
    });
    setTotalUsage(total);
    setIsCreditsAvailable(total < 20000);
  };

  const handleUpgradeClick = () => {
    setIsUpgradeOpen(true);
  };

  return (
    <div className='m-5'>
      <div className={`p-3 text-white rounded-lg ${
        totalUsage >= 20000 ? 'bg-red-600' : 
        totalUsage >= 15000 ? 'bg-yellow-600' : 
        'bg-primary'
      }`}>
        <h2>Credits</h2>
        <div className='h-2 bg-[#9981f9] w-full rounded-full mt-3'>
          <div className='h-2 bg-white rounded-full'
            style={{
              width: `${Math.min((totalUsage / 20000) * 100, 100)}%`
            }}>
          </div>
        </div>
        <h2 className='text-sm my-2'>{totalUsage}/20,000 Credits used</h2>
        {totalUsage >= 15000 && (
          <p className='text-xs mt-1'>
            {totalUsage >= 20000 ? 'Credits exhausted!' : 'Credits running low!'}
          </p>
        )}
      </div>

      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={totalUsage >= 20000 ? 'destructive' : 'secondary'}
            className='w-full my-3'
            onClick={handleUpgradeClick}
          >
            {totalUsage >= 20000 ? 'Upgrade Now' : 'Upgrade'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px]">
          <PricingPlans onSuccess={() => setIsUpgradeOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UsageTrack;
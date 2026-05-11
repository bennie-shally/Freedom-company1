import React, { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

interface CandleData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

export const TradingChart: React.FC = () => {
  const [data, setData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(44260);
  const [change, setChange] = useState(1.56);
  const [changeVal, setChangeVal] = useState(691);
  const [isPositive, setIsPositive] = useState(true);

  // Stats matching reference images
  const stats = useMemo(() => {
    if (data.length === 0) return { high: 44951, low: 43956, open: 44260, vol: "1292K" };
    const prices = data.flatMap(d => [d.high, d.low]);
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      open: data[0].open,
      vol: "1,292,440"
    };
  }, [data]);

  // Generate realistic OHLC data
  useEffect(() => {
    const initialData: CandleData[] = [];
    let price = 44000;
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      const open = price;
      const close = price + (Math.random() - 0.48) * 150;
      const high = Math.max(open, close) + Math.random() * 40;
      const low = Math.min(open, close) - Math.random() * 40;
      
      initialData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open,
        close,
        high,
        low
      });
      price = close;
    }
    setData(initialData);
    setCurrentPrice(initialData[initialData.length - 1].close);
  }, []);

  // Live simulation every 1.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev.length) return prev;
        const lastCandle = prev[prev.length - 1];
        const newOpen = lastCandle.close;
        const newClose = newOpen + (Math.random() - 0.47) * 80;
        const newHigh = Math.max(newOpen, newClose) + Math.random() * 20;
        const newLow = Math.min(newOpen, newClose) - Math.random() * 20;
        const nextTime = new Date();
        
        const newData = [...prev.slice(1), {
          time: nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: newOpen,
          close: newClose,
          high: newHigh,
          low: newLow
        }];
        
        const latest = newData[newData.length - 1].close;
        const start = newData[0].open;
        const diff = latest - start;
        const perc = (diff / start) * 100;
        
        setCurrentPrice(parseFloat(latest.toFixed(2)));
        setChangeVal(parseFloat(diff.toFixed(2)));
        setChange(parseFloat(perc.toFixed(2)));
        setIsPositive(perc >= 0);
        
        return newData;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const minPrice = useMemo(() => Math.min(...data.map(d => d.low)) * 0.9995, [data]);
  const maxPrice = useMemo(() => Math.max(...data.map(d => d.high)) * 1.0005, [data]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#05070A] p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col gap-6 md:gap-8 shadow-2xl"
    >
      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
            <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg md:text-xl font-black text-white tracking-tight">LIVE Market</h3>
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">PHP / Index Exchange</span>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">LIVE</span>
        </div>
      </div>

      {/* Main Pricing Section */}
      <div className="flex justify-between items-end relative z-10">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            ₱{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </h1>
          <div className={`flex items-center gap-2 md:gap-3 font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <div className="flex items-center">
              {isPositive ? <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" /> : <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6" />}
              <span className="text-lg md:text-xl">+{changeVal.toLocaleString()}</span>
            </div>
            <span className="bg-white/5 border border-white/10 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:text-sm tracking-tight font-mono">
              ({isPositive ? '+' : ''}{change}%)
            </span>
          </div>
        </div>
        
        <div className="hidden sm:flex flex-col gap-1.5 text-[11px] font-black uppercase text-slate-500 items-end mb-2">
          <div className="flex gap-4">
            <span className="tracking-[0.2em] opacity-40">High:</span>
            <span className="text-white tracking-tight">₱{stats.high.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex gap-4">
            <span className="tracking-[0.2em] opacity-40">Low:</span>
            <span className="text-white tracking-tight">₱{stats.low.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Candlestick Visualization */}
      <div className="h-[240px] w-full relative group">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#ffffff03" />
            <XAxis dataKey="time" hide />
            <YAxis domain={[minPrice, maxPrice]} hide />
            <Tooltip 
              cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as CandleData;
                  const isUp = d.close >= d.open;
                  return (
                    <div className="bg-[#050608] border border-white/10 p-5 rounded-2xl shadow-3xl backdrop-blur-2xl flex flex-col gap-3">
                      <p className="text-[10px] text-slate-500 font-black mb-1 flex justify-between items-center gap-6">
                        {d.time} <span className={`px-2 py-0.5 rounded-md ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{isUp ? 'BULL' : 'BEAR'}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px]">
                        <span className="text-slate-600 font-bold tracking-widest uppercase">Open:</span> <span className="text-white font-black">₱{d.open.toLocaleString()}</span>
                        <span className="text-slate-600 font-bold tracking-widest uppercase">High:</span> <span className="text-white font-black">₱{d.high.toLocaleString()}</span>
                        <span className="text-slate-600 font-bold tracking-widest uppercase">Low:</span> <span className="text-white font-black">₱{d.low.toLocaleString()}</span>
                        <span className="text-slate-600 font-bold tracking-widest uppercase">Close:</span> <span className="text-white font-black">₱{d.close.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Bar 
              dataKey="close" 
              animationDuration={500}
              shape={(props: any) => {
                const { x, y, width, height, open, close } = props;
                const isGreen = close >= open;
                const fill = isGreen ? '#10b981' : '#ef4444';
                return (
                  <g>
                    <rect 
                      x={x + 2} 
                      y={y} 
                      width={width - 4} 
                      height={Math.max(Math.abs(height), 2)} 
                      fill={fill} 
                      rx={1}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.close >= entry.open ? '#10b981' : '#ef4444'} 
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Details */}
      <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
        <div className="flex gap-10">
          <div className="flex flex-col gap-1.5">
            <span className="opacity-40 text-[9px] font-black">Open Node</span>
            <span className="text-white tracking-tight">₱{stats.open.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="opacity-40 text-[9px] font-black">Volume (24h)</span>
            <span className="text-white tracking-tight font-mono">{stats.vol}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="opacity-40 text-[9px] font-black">Sync Frequency</span>
          <span className="text-emerald-500/80 italic font-medium tracking-normal text-[10px] bg-emerald-500/5 px-2 py-0.5 rounded-md">Live every 1.8s</span>
        </div>
      </div>
    </motion.div>
  );
};

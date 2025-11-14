import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { toYYYYMMDD } from '../utils/date';
import { PieChartIcon, BarChartIcon } from '../components/icons';

const StatCard: React.FC<{ title: string, amount: number, color: string }> = ({ title, amount, color }) => (
    <Card className={`border-l-4 ${color}`}>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Rs. {amount.toLocaleString('en-IN')}
        </p>
    </Card>
);

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" className="text-lg font-bold fill-slate-900 dark:fill-white">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} className="text-sm fill-slate-700 dark:fill-slate-300">{`Rs ${value.toLocaleString('en-IN')}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} className="text-xs fill-slate-500 dark:fill-slate-400">
        {`( ${(percent * 100).toFixed(2)}% )`}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: pld.stroke}}></div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {pld.name}: <span className="font-semibold">{`Rs. ${pld.value.toLocaleString('en-IN')}`}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


const DashboardPage: React.FC = () => {
    const { transactions } = useData();
    const [activeIndex, setActiveIndex] = React.useState(-1);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const PatchedPie = Pie as any;

    const currentMonthTransactions = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const monthStr = `${year}-${month}`;
        return transactions.filter(t => toYYYYMMDD(new Date(t.date)).startsWith(monthStr));
    }, [transactions]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const income = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [currentMonthTransactions]);

    const expenseByCategory = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
            if (!categoryMap[t.category]) {
                categoryMap[t.category] = 0;
            }
            categoryMap[t.category] += t.amount;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [currentMonthTransactions]);
    
    const weeklySpending = useMemo(() => {
        const data: { name: string, expense: number, income: number }[] = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);

            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayStr = toYYYYMMDD(date);

            const dailyTransactions = transactions.filter(t => toYYYYMMDD(new Date(t.date)) === dayStr);
            
            const dailyExpense = dailyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const dailyIncome = dailyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            data.push({ name: dayName, expense: dailyExpense, income: dailyIncome });
        }
        return data;
    }, [transactions]);

    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

    const statCards = [
        { title: "Income", amount: totalIncome, color: "border-emerald-500" },
        { title: "Expense", amount: totalExpense, color: "border-rose-500" },
        { title: "Balance", amount: balance, color: "border-slate-500" }
    ];
    
    const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Summary for {currentMonthName}
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                     <div key={card.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <StatCard title={card.title} amount={card.amount} color={card.color} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <Card>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Expense by Category</h3>
                         {expenseByCategory.length > 0 ? (
                            <div className="flex flex-col md:flex-row items-center -mt-4 h-[300px]">
                                <ResponsiveContainer width="60%" height="100%">
                                    <PieChart>
                                        <PatchedPie
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            data={expenseByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#a1a1aa"
                                            dataKey="value"
                                            onMouseEnter={onPieEnter}
                                            onMouseLeave={() => setActiveIndex(-1)}
                                        >
                                            {expenseByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} className="focus:outline-none" />
                                            ))}
                                        </PatchedPie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="w-full md:w-[40%] md:ml-4 space-y-2 text-sm max-h-[250px] overflow-y-auto pr-2">
                                    {expenseByCategory.map((entry, index) => (
                                        <div
                                            key={`legend-${index}`}
                                            className="flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer"
                                            style={{ backgroundColor: index === activeIndex ? `${CHART_COLORS[index % CHART_COLORS.length]}20` : 'transparent' }}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onMouseLeave={() => setActiveIndex(-1)}
                                        >
                                            <div className="flex items-center truncate">
                                                <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                                                <span className="text-slate-700 dark:text-slate-300 truncate">{entry.name}</span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2">
                                                {totalExpense > 0 ? ((entry.value / totalExpense) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                <PieChartIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                                <h4 className="font-semibold text-slate-700 dark:text-slate-300">No Expense Data Yet</h4>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs">Add an expense for this month to see a beautiful breakdown of your spending.</p>
                            </div>
                        )}
                    </Card>
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <Card>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Last 7 Days Trend</h3>
                        {weeklySpending.some(d => d.income > 0 || d.expense > 0) ? (
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={weeklySpending} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                  <defs>
                                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'currentColor' }} stroke="none" />
                                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} stroke="none" tickFormatter={(value) => `Rs.${Number(value) / 1000}k`} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} name="Income" />
                                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} name="Expense" />
                              </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                <BarChartIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                                <h4 className="font-semibold text-slate-700 dark:text-slate-300">No Recent Activity</h4>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs">Transactions made in the last 7 days will appear here.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
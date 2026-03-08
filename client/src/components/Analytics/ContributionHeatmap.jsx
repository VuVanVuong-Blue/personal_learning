import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Contribution Heatmap Component
 * Displays a GitHub/LeetCode style contribution graph based on study sessions.
 */
const ContributionHeatmap = ({ userId }) => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Generate years from 2024 to current year + 1 for demo purposes
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: currentYear - 2024 + 2 }, (_, i) => currentYear + 1 - i);

    const [selectedYear, setSelectedYear] = useState(currentYear);

    useEffect(() => {
        if (!userId) return;

        const fetchHeatmapData = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/analytics/heatmap/${userId}?year=${selectedYear}`);
                setHeatmapData(res.data || []);
            } catch (error) {
                console.error("Error fetching heatmap:", error);
                toast.error("Không thể tải dữ liệu hoạt động");
            } finally {
                setLoading(false);
            }
        };

        fetchHeatmapData();
    }, [userId, selectedYear]);

    // Data Processing: Convert flat array to a Date Map for quick lookup
    const dataMap = useMemo(() => {
        const map = new Map();
        heatmapData.forEach(item => {
            map.set(item.date, item.count); // item.date = 'YYYY-MM-DD'
        });
        return map;
    }, [heatmapData]);

    // Generate Calendar Grid Grouped by Month
    const { monthsData, totalContributions } = useMemo(() => {
        let total = 0;
        const months = [];

        for (let m = 0; m < 12; m++) {
            const startDate = new Date(selectedYear, m, 1);
            const endDate = new Date(selectedYear, m + 1, 0);

            const grid = [];
            let currentDate = new Date(startDate);
            // Move back to Sunday
            currentDate.setDate(currentDate.getDate() - currentDate.getDay());

            while (currentDate <= endDate || currentDate.getDay() !== 0) {
                if (currentDate > endDate && currentDate.getDay() === 0) break;

                if (currentDate.getDay() === 0) grid.push([]);

                if (currentDate.getMonth() === m && currentDate.getFullYear() === selectedYear) {
                    const yearStr = currentDate.getFullYear();
                    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(currentDate.getDate()).padStart(2, '0');
                    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

                    const count = dataMap.get(dateStr) || 0;
                    total += count;

                    grid[grid.length - 1].push({
                        date: new Date(currentDate),
                        dateStr,
                        count,
                        isCurrentMonth: true
                    });
                } else {
                    grid[grid.length - 1].push({
                        isCurrentMonth: false
                    });
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Format month label, e.g., "Thg 1"
            const label = startDate.toLocaleString('vi-VN', { month: 'short' }).replace('thg ', 'Tháng ');
            months.push({ label, grid });
        }

        return { monthsData: months, totalContributions: total };
    }, [selectedYear, dataMap]);

    // Map count to color intensity levels (Tailwind classes)
    const getColorClass = (count) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count === 1) return 'bg-emerald-200';
        if (count === 2) return 'bg-emerald-300';
        if (count === 3) return 'bg-emerald-400';
        if (count >= 4) return 'bg-emerald-500';
        return 'bg-gray-100';
    };

    const getTooltipText = (count, dateStr) => {
        const dateObj = new Date(dateStr);
        const formattedDate = dateObj.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (count === 0) return `Chưa có hoạt động nào vào ${formattedDate}`;
        return `${count} phiên học vào ${formattedDate}`;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Biểu đồ Hoạt động
                    </h2>
                    <p className="text-sm text-gray-500">
                        {totalContributions} phiên học trong năm {selectedYear}
                    </p>
                </div>

                {/* Year Selector (LeetCode style) */}
                <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100 overflow-x-auto max-w-full">
                    {availableYears.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${selectedYear === year
                                ? 'bg-white shadow-sm text-emerald-600 border border-gray-200'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="relative">
                    {/* Heatmap Grid Container */}
                    <div className="flex overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {/* Y-Axis: Days of week */}
                        <div className="flex flex-col gap-[3px] text-[10px] text-gray-400 font-medium pr-3 mt-[24px] sticky left-0 bg-white z-10">
                            <span className="h-[10px]" title="Chủ nhật"></span>
                            <span className="h-[10px] leading-[10px]" title="Thứ hai">T2</span>
                            <span className="h-[10px]" title="Thứ ba"></span>
                            <span className="h-[10px] leading-[10px]" title="Thứ tư">T4</span>
                            <span className="h-[10px]" title="Thứ năm"></span>
                            <span className="h-[10px] leading-[10px]" title="Thứ sáu">T6</span>
                            <span className="h-[10px]" title="Thứ bảy"></span>
                        </div>

                        {/* Months Layout */}
                        <div className="flex gap-5">
                            {monthsData.map((month, mIdx) => (
                                <div key={mIdx} className="flex flex-col gap-2">
                                    <span className="text-[12px] font-semibold text-gray-500">{month.label}</span>
                                    <div className="flex gap-[3px]">
                                        {month.grid.map((week, wIdx) => (
                                            <div key={wIdx} className="flex flex-col gap-[3px]">
                                                {week.map((day, dIdx) => (
                                                    day.isCurrentMonth ? (
                                                        <div
                                                            key={dIdx}
                                                            className={`w-[10px] h-[10px] rounded-[2px] ${getColorClass(day.count)} cursor-help transition-all duration-200 hover:ring-1 hover:ring-black/20`}
                                                            title={getTooltipText(day.count, day.dateStr)}
                                                        ></div>
                                                    ) : (
                                                        <div key={dIdx} className="w-[10px] h-[10px] rounded-[2px] bg-transparent"></div>
                                                    )
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 text-xs text-gray-500 mt-2">
                        <span>Ít</span>
                        <div className="flex gap-1">
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-gray-100"></div>
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-200"></div>
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-300"></div>
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400"></div>
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500"></div>
                        </div>
                        <span>Nhiều</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContributionHeatmap;

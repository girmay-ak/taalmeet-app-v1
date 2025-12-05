interface StatusIndicatorProps {
  status: 'available' | 'soon' | 'busy' | 'offline';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  timeLeft?: number; // minutes
  lastActive?: string;
}

export function StatusIndicator({ 
  status, 
  size = 'small', 
  showLabel = false,
  timeLeft,
  lastActive
}: StatusIndicatorProps) {
  const sizeMap = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-6 h-6'
  };

  const colors = {
    available: 'bg-[#10B981]',
    soon: 'bg-[#F59E0B]',
    busy: 'bg-[#EF4444]',
    offline: 'bg-[#6B7280]'
  };

  const labels = {
    available: 'Available now',
    soon: timeLeft ? `Available in ${timeLeft}m` : 'Available soon',
    busy: 'Busy',
    offline: lastActive || 'Offline'
  };

  const emojis = {
    available: '🟢',
    soon: '🟡',
    busy: '🔴',
    offline: '⚫'
  };

  if (!showLabel) {
    return (
      <div className={`${sizeMap[size]} ${colors[status]} rounded-full border-2 border-white shadow-lg`} />
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
      status === 'available' ? 'bg-[#10B981]/20' :
      status === 'soon' ? 'bg-[#F59E0B]/20' :
      status === 'busy' ? 'bg-[#EF4444]/20' :
      'bg-[#6B7280]/20'
    }`}>
      <span className="text-sm">{emojis[status]}</span>
      <span className={`text-xs font-semibold ${
        status === 'available' ? 'text-[#10B981]' :
        status === 'soon' ? 'text-[#F59E0B]' :
        status === 'busy' ? 'text-[#EF4444]' :
        'text-[#9CA3AF]'
      }`}>
        {labels[status]}
      </span>
    </div>
  );
}

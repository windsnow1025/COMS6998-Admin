import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import {AdminDayResDto} from '@/client/nest';
import {formatDate} from '@/lib/admin/Format';

const Width = 720;
const Height = 180;
const Pad = {top: 12, right: 8, bottom: 24, left: 30};

// The last days' picks and voters as grouped bars
export default function DayChart({days}: { days: AdminDayResDto[] }) {
  const theme = useTheme();
  const [hovered, setHovered] = React.useState<number | null>(null);
  const series = [
    {label: 'Picks', color: theme.palette.primary.main, value: (day: AdminDayResDto) => day.picks},
    {label: 'Voters', color: theme.palette.success.main, value: (day: AdminDayResDto) => day.voters},
  ];

  const plotWidth = Width - Pad.left - Pad.right;
  const plotHeight = Height - Pad.top - Pad.bottom;
  const max = Math.max(1, ...days.map((day) => Math.max(day.picks, day.voters)));
  const slot = plotWidth / days.length;
  const barWidth = Math.min(14, (slot - 6) / series.length);
  // The height of a day's tallest bar, with a floor that keeps a zero day hoverable
  const tallestOf = (day: AdminDayResDto) =>
    Math.max((Math.max(...series.map(({value}) => value(day))) / max) * plotHeight, 8);

  const hoveredDay = hovered === null ? null : days[hovered];

  return (
    <Box
      // A hovered day lights its band and the other days' bars fade, on the cards' 0.2s
      sx={{
        '& .day .band': {opacity: 0, transition: 'opacity 0.2s'},
        '& .day:hover .band': {opacity: 0.12},
        '& .day .bar': {transition: 'opacity 0.2s'},
        '& svg:has(.day:hover) .day:not(:hover) .bar': {opacity: 0.35},
      }}
    >
      <Box className="flex-start-center" sx={{gap: 2, mb: 1}}>
        {series.map(({label, color}) => (
          <Box key={label} className="flex-center-nowrap" sx={{gap: 0.75}}>
            <Box sx={{width: 10, height: 10, borderRadius: 0.5, bgcolor: color}}/>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{position: 'relative'}}>
        <svg
          viewBox={`0 0 ${Width} ${Height}`}
          role="img"
          aria-label="Picks and voters per day"
          style={{width: '100%', height: 'auto', display: 'block'}}
          onMouseLeave={() => setHovered(null)}
        >
          {[0, 0.5, 1].map((fraction) => {
            const y = Pad.top + plotHeight * (1 - fraction);
            return (
              <g key={fraction}>
                <line
                  x1={Pad.left}
                  x2={Width - Pad.right}
                  y1={y}
                  y2={y}
                  stroke={theme.palette.divider}
                  strokeWidth={1}
                />
                <text
                  x={Pad.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={10}
                  fill={theme.palette.text.secondary}
                >
                  {Math.round(max * fraction)}
                </text>
              </g>
            );
          })}
          {days.map((day, index) => {
            const groupX = Pad.left + slot * index + (slot - barWidth * series.length) / 2;
            const tallest = tallestOf(day);
            return (
              <g
                key={day.date}
                className="day"
                onMouseEnter={() => setHovered(index)}
              >
                <rect
                  className="band"
                  x={Pad.left + slot * index}
                  y={Pad.top}
                  width={slot}
                  height={plotHeight}
                  fill={theme.palette.text.primary}
                  rx={2}
                  pointerEvents="none"
                />
                {/* The hover's hit area: the slot from the day's tallest bar down, so empty plot space triggers nothing */}
                <rect
                  className="hit"
                  x={Pad.left + slot * index}
                  y={Pad.top + plotHeight - tallest}
                  width={slot}
                  height={tallest}
                  fill="transparent"
                />
                {series.map(({label, color, value}, seriesIndex) => {
                  const height = (value(day) / max) * plotHeight;
                  return (
                    <rect
                      key={label}
                      className="bar"
                      x={groupX + barWidth * seriesIndex}
                      y={Pad.top + plotHeight - height}
                      width={barWidth}
                      height={height}
                      fill={color}
                      rx={2}
                    />
                  );
                })}
                {index % 2 === days.length % 2 && (
                  <text
                    x={Pad.left + slot * index + slot / 2}
                    y={Height - 8}
                    textAnchor="middle"
                    fontSize={10}
                    fill={theme.palette.text.secondary}
                  >
                    {day.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hovered !== null && hoveredDay && (
          <Box
            sx={{
              position: 'absolute',
              left: `${Math.min(92, Math.max(8, ((Pad.left + slot * (hovered + 0.5)) / Width) * 100))}%`,
              bottom: `${100 - ((Pad.top + plotHeight - tallestOf(hoveredDay)) / Height) * 100}%`,
              transform: 'translate(-50%, -8px)',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              boxShadow: 2,
              px: 1.5,
              py: 1,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 1,
            }}
          >
            <Typography variant="caption" sx={{display: 'block', fontWeight: 600}}>
              {formatDate(hoveredDay.date)}
            </Typography>
            {series.map(({label, color, value}) => (
              <Box key={label} className="flex-start-center-nowrap" sx={{gap: 0.75}}>
                <Box sx={{width: 8, height: 8, borderRadius: 0.5, bgcolor: color}}/>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="caption">{value(hoveredDay)}</Typography>
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
              {hoveredDay.uploads} uploads · {hoveredDay.captions} captions
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

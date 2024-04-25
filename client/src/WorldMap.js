import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { scaleQuantize } from 'd3-scale';
import { feature } from 'topojson-client';
import worldAtlas from './world-110m2.json';
import './tooltip.css';
import 'react-tooltip/dist/react-tooltip.css';

const WorldMap = () => {
  const [dukeUnits, setDukeUnits] = useState({});
  const [tooltipContent, setTooltipContent] = useState('');

  useEffect(() => {
    const fetchDukeUnits = async () => {
      const response = await fetch('/api/duke-units');
      const data = await response.json();
      setDukeUnits(data);
    };

    fetchDukeUnits();
  }, []);

  const colorScale = scaleQuantize()
    .domain([1, Math.max(...Object.values(dukeUnits).map((units) => Object.values(units).reduce((a, b) => a + b)))])
    .range(['#ffedea', '#ffcec5', '#ffad9f', '#ff8a75', '#ff5533', '#e2492d', '#be3d26', '#9a311f', '#782618']);

  const onMouseEnter = (geo, current = { value: 'N/A', units: {} }) => {
    return () => {
      const unitInfo = Object.entries(current.units)
        .map(([unit, count]) => `${unit}: ${count}`)
        .join(', ');
      setTooltipContent(`${geo.properties.NAME}: ${current.value} (${unitInfo})`);
    };
  };

  const onMouseLeave = () => {
    setTooltipContent('');
  };

  return (
    <div>
      <ComposableMap
        projectionConfig={{
          scale: 205,
          rotation: [-11, 0, 0],
        }}
        width={980}
        height={551}
        style={{
          width: '100%',
          height: 'auto',
        }}
      >
        <Geographies geography={feature(worldAtlas, worldAtlas.objects.countries)}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryDukeUnits = dukeUnits[geo.properties.NAME];
              const totalAgreements = countryDukeUnits ? Object.values(countryDukeUnits).reduce((a, b) => a + b) : 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={totalAgreements ? colorScale(totalAgreements) : '#F5F4F6'}
                  onMouseEnter={onMouseEnter(geo, { value: totalAgreements, units: countryDukeUnits || {} })}
                  onMouseLeave={onMouseLeave}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <ReactTooltip>{tooltipContent}</ReactTooltip>
    </div>
  );
};

export default WorldMap;

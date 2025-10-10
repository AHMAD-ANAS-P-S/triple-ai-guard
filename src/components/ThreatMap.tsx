import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface ThreatLocation {
  id: string;
  coordinates: [number, number];
  country: string;
  ip: string;
  domain: string;
  threatLevel: string;
  count: number;
}

interface ThreatMapProps {
  threats: any[];
}

const ThreatMap = ({ threats }: ThreatMapProps) => {
  const [threatLocations, setThreatLocations] = useState<ThreatLocation[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationPromises = threats
          .filter(threat => threat.user_ip)
          .map(async (threat) => {
            try {
              const ip = threat.user_ip.split(',')[0].trim();
              
              // Use edge function to avoid CORS issues
              const { supabase } = await import('@/integrations/supabase/client');
              const { data, error } = await supabase.functions.invoke('geolocate-ip', {
                body: { ip }
              });
              
              if (!error && data?.status === 'success') {
                return {
                  id: threat.id,
                  coordinates: [data.lon, data.lat] as [number, number],
                  country: data.country,
                  ip: threat.user_ip,
                  domain: threat.url ? new URL(threat.url).hostname : 'Email',
                  threatLevel: threat.threat_level,
                  count: 1
                };
              }
            } catch (error) {
              console.error('Error fetching location:', error);
            }
            return null;
          });

        const locations = (await Promise.all(locationPromises)).filter(Boolean) as ThreatLocation[];
        
        // Aggregate by country
        const aggregated = locations.reduce((acc, loc) => {
          const key = `${loc.country}-${loc.coordinates[0]}-${loc.coordinates[1]}`;
          if (acc[key]) {
            acc[key].count++;
          } else {
            acc[key] = loc;
          }
          return acc;
        }, {} as Record<string, ThreatLocation>);

        setThreatLocations(Object.values(aggregated));
      } catch (error) {
        console.error('Error processing locations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (threats.length > 0) {
      fetchLocations();
    } else {
      setLoading(false);
    }
  }, [threats]);

  const colorScale = scaleLinear<string>()
    .domain([0, 5, 10])
    .range(["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"]);

  const getMarkerColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high':
        return 'hsl(var(--destructive))';
      case 'medium':
        return 'hsl(var(--warning))';
      default:
        return 'hsl(var(--success))';
    }
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Global Threat Map</h2>
        </div>
        <Badge variant="outline" className="gap-1">
          <MapPin className="w-3 h-3" />
          {threatLocations.length} Locations
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[500px] text-muted-foreground">
          <div className="text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <p>Loading threat locations...</p>
          </div>
        </div>
      ) : threatLocations.length === 0 ? (
        <div className="flex items-center justify-center h-[500px] text-muted-foreground">
          <div className="text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No threat locations to display</p>
            <p className="text-sm mt-2">Threats will appear here once detected</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
            }}
            className="w-full h-[500px]"
          >
            <ZoomableGroup>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "hsl(var(--muted-foreground))", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              {threatLocations.map((threat) => (
                <Marker
                  key={threat.id}
                  coordinates={threat.coordinates}
                  onMouseEnter={() => setSelectedThreat(threat)}
                  onMouseLeave={() => setSelectedThreat(null)}
                >
                  <circle
                    r={Math.max(4, Math.min(threat.count * 2, 12))}
                    fill={getMarkerColor(threat.threatLevel)}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    className="cursor-pointer transition-all hover:scale-125"
                    opacity={0.8}
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>

          {selectedThreat && (
            <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg min-w-[250px] z-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Location Details</span>
                  <Badge className={`bg-${selectedThreat.threatLevel === 'high' ? 'destructive' : selectedThreat.threatLevel === 'medium' ? 'warning' : 'success'}/10 text-${selectedThreat.threatLevel === 'high' ? 'destructive' : selectedThreat.threatLevel === 'medium' ? 'warning' : 'success'}`}>
                    {selectedThreat.threatLevel}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium text-foreground">{selectedThreat.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IP:</span>
                    <span className="font-mono text-xs text-foreground">{selectedThreat.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domain:</span>
                    <span className="font-medium text-foreground truncate max-w-[150px]">{selectedThreat.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Threats:</span>
                    <span className="font-bold text-foreground">{selectedThreat.count}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Low Risk</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ThreatMap;

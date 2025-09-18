import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Flag } from "lucide-react";
import { School } from "@shared/schema";

interface SchoolAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (school: School) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "data-testid"?: string;
}

export default function SchoolAutocomplete({
  value,
  onChange,
  onSelect,
  disabled = false,
  placeholder = "Enter your school's name",
  id,
  "data-testid": dataTestId
}: SchoolAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<School[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.length >= 2) {
      searchSchools(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const searchSchools = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const schools = await response.json();
        setSuggestions(schools.slice(0, 10)); // Limit to 10 suggestions
        setShowSuggestions(schools.length > 0);
      }
    } catch (error) {
      console.error("Error searching schools:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSchoolSelect = (school: School) => {
    onChange(school.name);
    onSelect(school);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <Label htmlFor={id} className="flex items-center space-x-2">
        <Building className="w-4 h-4" />
        <span>School Name</span>
      </Label>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        data-testid={dataTestId}
        className="w-full"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-8 text-xs text-muted-foreground">
          Searching...
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((school) => (
            <div
              key={school.id}
              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={() => handleSchoolSelect(school)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{school.name}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>{school.district}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{school.city}</span>
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      <Flag className="w-3 h-3 mr-1" />
                      {school.state}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-1">
        Start typing to search for your school. Select from the list when it appears.
      </p>
    </div>
  );
}

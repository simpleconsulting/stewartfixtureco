"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";
import { fetchAutocomplete, fetchPlaceDetails, debounce, type PlacePrediction, type AutocompleteResponse, type PlaceDetails } from "@/lib/places-api";
import { useSessionToken } from "@/lib/places-session";

interface AddressAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (placeDetails: PlaceDetails | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function AddressAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Start typing an address...",
  className,
  required = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getSessionToken, clearSession } = useSessionToken();

  // Create the debounced function
  const debouncedFetchSuggestions = useCallback(() => {
    return debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const sessionToken = getSessionToken();
        
        const response: AutocompleteResponse = await fetchAutocomplete({
          input: query,
          sessionToken,
          includedPrimaryTypes: ['street_address', 'route', 'subpremise'],
          includedRegionCodes: ['us'],
          languageCode: 'en',
          regionCode: 'us',
          inputOffset: query.length
        });

        const placePredictions = response.suggestions
          ?.filter(suggestion => suggestion.placePrediction)
          .map(suggestion => suggestion.placePrediction!)
          .slice(0, 5) || [];

        setSuggestions(placePredictions);
        setIsOpen(placePredictions.length > 0);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to load address suggestions. Please type your address manually.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [getSessionToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    
    if (newValue.trim()) {
      setIsLoading(true);
      debouncedFetchSuggestions()(newValue);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: PlacePrediction) => {
    const addressText = suggestion.text.text;
    onChange(addressText);
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Fetch place details if callback provided
    if (onPlaceSelected && suggestion.placeId) {
      try {
        setIsLoading(true);
        const sessionToken = getSessionToken();
        const placeDetails = await fetchPlaceDetails({
          placeId: suggestion.placeId,
          sessionToken,
          languageCode: 'en',
          regionCode: 'us'
        });
        onPlaceSelected(placeDetails);
      } catch (error) {
        console.error('Error fetching place details:', error);
        onPlaceSelected(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Clear session after selection (session concluded)
    clearSession();
    
    // Focus back to input
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow click on suggestions
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={cn(
            "border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 pr-10",
            className
          )}
          required={required}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#FCA311]" />
          ) : (
            <MapPin className={cn(
              "h-4 w-4 transition-colors",
              isOpen ? "text-[#FCA311]" : "text-gray-400"
            )} />
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {/* Dropdown with suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#FCA311]/20 rounded-lg shadow-lg backdrop-blur-sm max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.placeId}
              className={cn(
                "px-4 py-3 cursor-pointer transition-colors border-b border-[#FCA311]/10 last:border-b-0",
                "hover:bg-[#FCA311]/8 focus:bg-[#FCA311]/8",
                selectedIndex === index && "bg-[#FCA311]/12"
              )}
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-[#FCA311]" />
                </div>
                <div className="flex-1 min-w-0">
                  {suggestion.structuredFormat ? (
                    <>
                      <div className="font-medium text-[#14213D] text-sm truncate">
                        {suggestion.structuredFormat.mainText.text}
                      </div>
                      {suggestion.structuredFormat.secondaryText && (
                        <div className="text-gray-600 text-xs truncate">
                          {suggestion.structuredFormat.secondaryText.text}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="font-medium text-[#14213D] text-sm">
                      {suggestion.text.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
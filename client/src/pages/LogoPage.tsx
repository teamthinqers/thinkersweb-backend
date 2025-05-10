import React from "react";
import { Button } from "@/components/ui/button";

export default function LogoPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold text-center">DotSpark Logo Downloads</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center gap-4 border p-6 rounded-lg">
          <div className="w-40 h-40 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold">Full Logo</h2>
          <p className="text-muted-foreground text-center text-sm">DotSpark logo with background circle</p>
          <Button asChild>
            <a href="/logo.svg" download="dotspark-logo.svg">Download SVG</a>
          </Button>
        </div>
        
        <div className="flex flex-col items-center gap-4 border p-6 rounded-lg">
          <div className="w-40 h-40 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold">Transparent Logo</h2>
          <p className="text-muted-foreground text-center text-sm">DotSpark logo with transparent background</p>
          <Button asChild>
            <a href="/logo-transparent.svg" download="dotspark-logo-transparent.svg">Download SVG</a>
          </Button>
        </div>
        
        <div className="flex flex-col items-center gap-4 border p-6 rounded-lg">
          <div className="w-40 h-40 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold">Simple Icon</h2>
          <p className="text-muted-foreground text-center text-sm">DotSpark icon only</p>
          <Button asChild>
            <a href="/icon.svg" download="dotspark-icon.svg">Download SVG</a>
          </Button>
        </div>
      </div>
      
      <p className="mt-8 text-muted-foreground text-sm max-w-md text-center">
        If the download links don't work, please right-click on the logos above and select "Save image as..." to download them.
      </p>
      
      <Button variant="outline" asChild className="mt-4">
        <a href="/">Back to Home</a>
      </Button>
    </div>
  );
}
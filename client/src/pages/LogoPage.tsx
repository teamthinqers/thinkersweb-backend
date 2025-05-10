import React from "react";
import { Button } from "@/components/ui/button";

// Base64 encoded version of the logo SVG
const logoBase64 = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgZmlsbD0ibm9uZSI+CiAgPCEtLSBCYWNrZ3JvdW5kIGNpcmNsZSB3aXRoIGdyYWRpZW50IC0tPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTUiIGZpbGw9InVybCgjZ3JhZGllbnQpIiAvPgogIAogIDwhLS0gQ2VudHJhbCBzcGFyayBzeW1ib2wgLS0+CiAgPHBhdGggZD0iTTEwMCAzMEwxMTcuNSA4MC44NjU0TDE3MS43NDcgODAuODY1NEwxMjcuNjM1IDExMi4xMzVMMTQ1LjUzNCAxNjNMMTAwIDEzMi41TDU0LjQ2NTggMTYzTDcyLjM2NTQgMTEyLjEzNUwyOC4yNTMxIDgwLjg2NTRIODIuNUwxMDAgMzBaIiBmaWxsPSJ3aGl0ZSIgLz4KICAKICA8IS0tIE5ldXJhbCBjb25uZWN0aW9uIGRvdHMgLSBob3Jpem9udGFsIGxpbmUgLS0+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSIxMDAiIHI9IjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIC8+CiAgPGNpcmNsZSBjeD0iMTQwIiBjeT0iMTAwIiByPSI1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44IiAvPgogIAogIDwhLS0gTmV1cmFsIGNvbm5lY3Rpb24gZG90cyAtIHZlcnRpY2FsIGxpbmUgLS0+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNjAiIHI9IjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIC8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTQwIiByPSI1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44IiAvPgogIAogIDwhLS0gTmV1cmFsIGNvbm5lY3Rpb24gZG90cyAtIGRpYWdvbmFsIGxpbmVzIC0tPgogIDxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIC8+CiAgPGNpcmNsZSBjeD0iMTI1IiBjeT0iNzUiIHI9IjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIC8+CiAgPGNpcmNsZSBjeD0iNzUiIGN5PSIxMjUiIHI9IjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIC8+CiAgPGNpcmNsZSBjeD0iMTI1IiBjeT0iMTI1IiByPSI1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44IiAvPgogIAogIDwhLS0gTmV1cmFsIGNvbm5lY3Rpb24gbGluZXMgLS0+CiAgPGxpbmUgeDE9IjYwIiB5MT0iMTAwIiB4Mj0iOTUiIHkyPSIxMDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC41IiAvPgogIDxsaW5lIHgxPSIxMDUiIHkxPSIxMDAiIHgyPSIxNDAiIHkyPSIxMDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC41IiAvPgogIDxsaW5lIHgxPSIxMDAiIHkxPSI2MCIgeDI9IjEwMCIgeTI9Ijk1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNSIgLz4KICA8bGluZSB4MT0iMTAwIiB5MT0iMTA1IiB4Mj0iMTAwIiB5Mj0iMTQwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNSIgLz4KICA8bGluZSB4MT0iODAiIHkxPSI4MCIgeDI9Ijk1IiB5Mj0iOTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC41IiAvPgogIDxsaW5lIHgxPSIxMDUiIHkxPSI5NSIgeDI9IjEyMCIgeTI9IjgwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNSIgLz4KICA8bGluZSB4MT0iODAiIHkxPSIxMjAiIHgyPSI5NSIgeTI9IjEwNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjUiIC8+CiAgPGxpbmUgeDE9IjEwNSIgeTE9IjEwNSIgeDI9IjEyMCIgeTI9IjEyMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjUiIC8+CiAgCiAgPCEtLSBEZWZpbmUgdGhlIGdyYWRpZW50IC0tPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiIGdyYWRpZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzdCNjFGRiIgLz4gPCEtLSBQcmltYXJ5IGNvbG9yIC0tPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNBODVDRkYiIC8+IDwhLS0gU2Vjb25kYXJ5IGNvbG9yIC0tPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+Cjwvc3ZnPg==`;

// Base64 encoded version of the transparent logo SVG
const transparentLogoBase64 = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgZmlsbD0ibm9uZSI+CiAgPCEtLSBDZW50cmFsIHNwYXJrIHN5bWJvbCAtLT4KICA8cGF0aCBkPSJNMTAwIDMwTDExNy41IDgwLjg2NTRMMTcxLjc0NyA4MC44NjU0TDEyNy42MzUgMTEyLjEzNUwxNDUuNTM0IDE2M0wxMDAgMTMyLjVMNTQuNDY1OCAxNjNMNzIuMzY1NCAxMTIuMTM1TDI4LjI1MzEgODAuODY1NEg4Mi41TDEwMCAzMFoiIGZpbGw9IiM3QjYxRkYiIC8+CiAgCiAgPCEtLSBOZXVyYWwgY29ubmVjdGlvbiBkb3RzIC0gaG9yaXpvbnRhbCBsaW5lIC0tPgogIDxjaXJjbGUgY3g9IjYwIiBjeT0iMTAwIiByPSI1IiBmaWxsPSIjN0I2MUZGIiBvcGFjaXR5PSIwLjgiIC8+CiAgPGNpcmNsZSBjeD0iMTQwIiBjeT0iMTAwIiByPSI1IiBmaWxsPSIjN0I2MUZGIiBvcGFjaXR5PSIwLjgiIC8+CiAgCiAgPCEtLSBOZXVyYWwgY29ubmVjdGlvbiBkb3RzIC0gdmVydGljYWwgbGluZSAtLT4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI2MCIgcj0iNSIgZmlsbD0iIzdCNjFGRiIgb3BhY2l0eT0iMC44IiAvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjE0MCIgcj0iNSIgZmlsbD0iIzdCNjFGRiIgb3BhY2l0eT0iMC44IiAvPgogIAogIDwhLS0gTmV1cmFsIGNvbm5lY3Rpb24gZG90cyAtIGRpYWdvbmFsIGxpbmVzIC0tPgogIDxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjUiIGZpbGw9IiM3QjYxRkYiIG9wYWNpdHk9IjAuOCIgLz4KICA8Y2lyY2xlIGN4PSIxMjUiIGN5PSI3NSIgcj0iNSIgZmlsbD0iIzdCNjFGRiIgb3BhY2l0eT0iMC44IiAvPgogIDxjaXJjbGUgY3g9Ijc1IiBjeT0iMTI1IiByPSI1IiBmaWxsPSIjN0I2MUZGIiBvcGFjaXR5PSIwLjgiIC8+CiAgPGNpcmNsZSBjeD0iMTI1IiBjeT0iMTI1IiByPSI1IiBmaWxsPSIjN0I2MUZGIiBvcGFjaXR5PSIwLjgiIC8+CiAgCiAgPCEtLSBOZXVyYWwgY29ubmVjdGlvbiBsaW5lcyAtLT4KICA8bGluZSB4MT0iNjAiIHkxPSIxMDAiIHgyPSI5NSIgeTI9IjEwMCIgc3Ryb2tlPSIjQTg1Q0ZGIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNyIgLz4KICA8bGluZSB4MT0iMTA1IiB5MT0iMTAwIiB4Mj0iMTQwIiB5Mj0iMTAwIiBzdHJva2U9IiNBODVDRkYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC43IiAvPgogIDxsaW5lIHgxPSIxMDAiIHkxPSI2MCIgeDI9IjEwMCIgeTI9Ijk1IiBzdHJva2U9IiNBODVDRkYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC43IiAvPgogIDxsaW5lIHgxPSIxMDAiIHkxPSIxMDUiIHgyPSIxMDAiIHkyPSIxNDAiIHN0cm9rZT0iI0E4NUNGRiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjciIC8+CiAgPGxpbmUgeDE9IjgwIiB5MT0iODAiIHgyPSI5NSIgeTI9Ijk1IiBzdHJva2U9IiNBODVDRkYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC43IiAvPgogIDxsaW5lIHgxPSIxMDUiIHkxPSI5NSIgeDI9IjEyMCIgeTI9IjgwIiBzdHJva2U9IiNBODVDRkYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC43IiAvPgogIDxsaW5lIHgxPSI4MCIgeTE9IjEyMCIgeDI9Ijk1IiB5Mj0iMTA1IiBzdHJva2U9IiNBODVDRkYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC43IiAvPgogIDxsaW5lIHgxPSIxMDUiIHkxPSIxMDUiIHgyPSIxMjAiIHkyPSIxMjAiIHN0cm9rZT0iI0E4NUNGRiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjciIC8+Cjwvc3ZnPg==`;

// Base64 encoded version of the icon only
const iconBase64 = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgdmlld0JveD0iMCAwIDcyIDcyIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMzYgMTBMNDIuNSAyOUw2MS44MzQgMjlMNDYuMDQyIDQwLjNMNTIuMzkyIDU5LjNMMzYgNDcuMkwxOS42MDggNTkuM0wyNS45NTggNDAuM0wxMC4xNjYgMjlIMjkuNUwzNiAxMFoiIGZpbGw9IiM3QjYxRkYiIHN0cm9rZT0iI0E4NUNGRiIgc3Ryb2tlLXdpZHRoPSIyIiAvPgo8L3N2Zz4=`;

export default function LogoPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold text-center">DotSpark Logo Downloads</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center gap-4 border p-6 rounded-lg">
          <div className="w-40 h-40 flex items-center justify-center">
            <img src={logoBase64} alt="DotSpark Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold">Full Logo</h2>
          <p className="text-muted-foreground text-center text-sm">DotSpark logo with background circle</p>
          <Button asChild>
            <a href="/logo.svg" download="dotspark-logo.svg">Download SVG</a>
          </Button>
        </div>
        
        <div className="flex flex-col items-center gap-4 border p-6 rounded-lg">
          <div className="w-40 h-40 flex items-center justify-center">
            <img src={transparentLogoBase64} alt="DotSpark Transparent Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold">Transparent Logo</h2>
          <p className="text-muted-foreground text-center text-sm">DotSpark logo with transparent background</p>
          <Button asChild>
            <a href="/logo-transparent.svg" download="dotspark-logo-transparent.svg">Download SVG</a>
          </Button>
        </div>
        
        <div className="flex flex-col items-center gap-4 border p-6 rounded-lg">
          <div className="w-40 h-40 flex items-center justify-center">
            <img src={iconBase64} alt="DotSpark Icon" className="w-full h-full object-contain" />
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
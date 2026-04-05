"use client";

const GATEWAYS = [
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
];

/* ---------------- FETCH ---------------- */

export const fetchIPFS = async (cidOrUri: string) => {
  try {
    if (!cidOrUri) return null;

    let cid = cidOrUri;

    if (cidOrUri.startsWith("ipfs://")) {
      cid = cidOrUri.replace("ipfs://", "");
    }

    // Try multiple gateways (VERY IMPORTANT)
    for (const gateway of GATEWAYS) {
      try {
        const res = await fetch(gateway + cid);
        if (!res.ok) continue;

        const type = res.headers.get("content-type") || "";

        if (type.includes("application/json")) {
          return await res.json();
        }

        if (type.includes("text")) {
          return await res.text();
        }

        return await res.blob();
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
};

/* ---------------- RENDER ---------------- */

export const RenderIPFSContent = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <p className="text-zinc-500 text-sm">
        Loading IPFS...
      </p>
    );
  }

  /* ---------- STRING ---------- */
  if (typeof data === "string") {
    return (
      <pre className="text-xs bg-black p-3 rounded">
        {data}
      </pre>
    );
  }

  /* ---------- BLOB ---------- */
  if (data instanceof Blob) {
    const url = URL.createObjectURL(data);

    return (
      <a
        href={url}
        target="_blank"
        className="text-emerald-400 underline"
      >
        View Attachment
      </a>
    );
  }

  /* ---------- OBJECT (MAIN CASE) ---------- */
  if (typeof data === "object") {
    const {
      name,
      title,
      description,
      location,
      image,
      file,
      attributes,
      ...rest
    } = data;

    const displayName = name || title || "Untitled Asset";

    const resolveLink = (val: any) => {
      if (!val) return null;

      if (typeof val === "string") {
        if (val.startsWith("ipfs://")) {
          return val.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        return val;
      }

      if (val instanceof Blob) {
        return URL.createObjectURL(val);
      }

      return null;
    };

    const imageUrl = resolveLink(image);
    const fileUrl = resolveLink(file);

    return (
      <div className="space-y-4 mt-3">

        {/* TITLE */}
        <h3 className="text-lg font-bold text-white">
          {displayName}
        </h3>

        {/* DESCRIPTION */}
        {description && (
          <p className="text-sm text-zinc-400">
            {description}
          </p>
        )}

        {/* LOCATION */}
        {location && (
          <p className="text-xs text-emerald-400">
            📍 {location}
          </p>
        )}

        {/* ATTRIBUTES */}
        {Array.isArray(attributes) && (
          <div className="grid grid-cols-2 gap-2">
            {attributes.map((attr: any, i: number) => (
              <div
                key={i}
                className="bg-zinc-900 p-2 rounded text-xs"
              >
                <p className="text-zinc-500">
                  {attr.trait_type}
                </p>
                <p className="text-white">
                  {attr.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* IMAGE */}
        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            className="text-blue-400 underline text-sm"
          >
            View Image
          </a>
        )}

        {/* FILE */}
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            className="text-emerald-400 underline text-sm"
          >
            View File
          </a>
        )}

        {/* FALLBACK FIELDS */}
        {Object.keys(rest).length > 0 && (
          <pre className="text-xs bg-black p-3 rounded">
            {JSON.stringify(rest, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  return (
    <p className="text-zinc-500 text-xs">
      Unsupported format
    </p>
  );
};
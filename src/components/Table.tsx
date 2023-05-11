import { css } from "@emotion/css";
import { useEffect, useMemo, useState } from "react";
import { autoType, csvParse } from "d3-dsv";
import type { Device } from "../assets/devices.csv";

function useData<T>(get: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    get().then(d => setData(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return data;
}

export function Table({ search }: { search: string }) {
  const devices = useData(async () => {
    const { default: csv } = await import("../assets/devices.csv?raw");
    return csvParse<Device, string>(csv, autoType);
  });

  const columns = useMemo(
    (): {
      label: string;
      key: keyof Device | "resolution";
    }[] => [
      { label: "Name", key: "name" },
      { label: "Size", key: "diagonal" },
      { label: "Resolution", key: "resolution" },
      { label: "DPI", key: "ppi" },
      { label: "Type", key: "type" },
      { label: "Year", key: "year" },
      { label: "dppx", key: "dppx" },
    ],
    []
  );

  const [sortColumn, setSortColumn] = useState<string>();
  const [sortDirection, setSortDirection] = useState(1);

  const filtered = useMemo(() => {
    let res = devices;
    if (search) {
      res = res.filter(
        s =>
          String(s.manufacturer + " " + s.name)
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          s.diagonal.toString().includes(search) ||
          s.width.toString().includes(search) ||
          s.height.toString().includes(search) ||
          s.ppi?.toString().includes(search) ||
          s.dppx?.toString().includes(search)
      );
    }
    if (sortColumn === "name") {
      res = res.sort((a, b) => {
        const aName = a.manufacturer + a.name;
        const bName = b.manufacturer + b.name;
        return aName.localeCompare(bName) * sortDirection;
      });
    } else if (sortColumn === "resolution") {
      res = res.sort((a, b) => {
        const aRes = a.width * a.height;
        const bRes = b.width * b.height;
        return (aRes - bRes) * sortDirection;
      });
    } else if (sortColumn !== null) {
      res = res.sort((a: any, b: any) => {
        const aVal = a[sortColumn!];
        const bVal = b[sortColumn!];
        if (aVal === bVal) return 0;
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
        return aVal < bVal ? -sortDirection : sortDirection;
      });
    }

    return res;
  }, [devices, search, sortColumn, sortDirection]);

  return (
    <table
      className={css`
        width: 100%;
        border-spacing: 0;
        td,
        th {
          padding: 0.3em;
        }
        th {
          font-weight: 600;
        }
        th:first-child {
          text-align: right;
        }
        th:nth-child(4) {
          border-radius: 0.3em 0.3em 0 0;
        }

        th:nth-child(4),
        td:nth-child(4) {
          background-color: #fdd;
          text-shadow: 0 1px 1px white;
          @media (prefers-color-scheme: dark) {
            background-color: #470000;
            text-shadow: none;
          }
        }
      `}
    >
      <thead>
        <tr>
          {columns.map(({ label, key }) => (
            <th
              key={key}
              onClick={() => {
                if (key === sortColumn) {
                  setSortDirection(-sortDirection);
                } else {
                  setSortColumn(key);
                  setSortDirection(1);
                }
              }}
              className={css`
                cursor: pointer;
                text-align: center;
                font-variant-numeric: tabular-nums;
                ${key === sortColumn &&
                css`
                  background-color: #fdd;
                  text-shadow: 0 1px 1px white;
                  @media (prefers-color-scheme: dark) {
                    background-color: #470000;
                    text-shadow: none;
                  }
                `}
              `}
            >
              {label}
              {key === sortColumn && (sortDirection === 1 ? "▲" : "▼")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!filtered.length && (
          <tr>
            <td
              colSpan={5}
              className={css`
                text-align: center;
                padding: 40px !important;
              `}
            >
              No Results
            </td>
          </tr>
        )}
        {filtered.map(s => (
          <Row key={s.manufacturer + s.name + s.width} row={s} />
        ))}
      </tbody>
    </table>
  );
}

function Row({ row }: { row: Device }) {
  return (
    <tr>
      <th
        className={css`
          width: 50%;
          max-width: 50%;
          overflow: hidden;
        `}
      >
        <a href={`#${row.width}×${row.height}@${row.diagonal}″`}>
          <span>
            {row.manufacturer} {row.name}
          </span>
        </a>
      </th>
      <td>
        <span>{row.diagonal}</span>”
      </td>
      <td>
        <span>{row.width}</span>×<span>{row.height}</span>
      </td>
      <td
        className={css`
          text-align: center;
          font-variant-numeric: tabular-nums;
        `}
      >
        {getPPI(row)}
      </td>
      <td
        className={css`
          text-align: center;
          font-variant-numeric: tabular-nums;
        `}
      >
        {row.type ?? "-"}
      </td>
      <td
        className={css`
          text-align: center;
          font-variant-numeric: tabular-nums;
        `}
      >
        {row.year ?? "-"}
      </td>
      <td>{row.dppx ?? "?"}</td>
    </tr>
  );
}

function getPPI(row: Device) {
  return Math.round(
    Math.sqrt(row.width * row.width + row.height * row.height) / row.diagonal
  );
}

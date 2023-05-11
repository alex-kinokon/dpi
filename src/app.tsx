import { css } from "@emotion/css";
import { uniqBy } from "lodash-es";
import { useEffect, useState } from "preact/hooks";
import { useCallback, useMemo, useRef } from "react";
import logo from "./assets/logo.svg";
import searchIcon from "./assets/search.svg";
import noise from "./assets/noise.png";
import resolution from "./assets/resolutions.json";

const enum Dimension {
  d,
  w,
  h,
}

function calcDpi(w: number, h: number, d: number, opt: Dimension = Dimension.d) {
  // Calculate PPI/DPI
  w > 0 || (w = 1);
  h > 0 || (h = 1);
  const dpi =
    (opt === Dimension.d ? Math.sqrt(w * w + h * h) : opt === Dimension.w ? w : h) / d;
  return dpi > 0 ? Math.round(dpi) : 0;
}

const diagonal = [7, 11.6, 13.3, 14, 15.6, 17.3, 21, 24, 27];

function useData<T>(get: () => Promise<{ default: T[] }>) {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    get().then(d => setData(d.default));
  }, []);
  return data;
}

export function App() {
  const [width, setWidth] = useState(screen.width);
  const [height, setHeight] = useState(screen.height);
  const [dimension, setDimension] = useState<Dimension>(Dimension.d);
  const [physical, setPhysical] = useState(13.3);
  const [search, setSearch] = useState("");

  const devices = useData(() => import("./assets/devices.json"));

  const currentScreen = useMemo(
    () => ({
      width: screen.width * window.devicePixelRatio,
      height: screen.height * window.devicePixelRatio,
    }),
    []
  );

  const output = useRef<HTMLOutputElement>(null);
  const [outputMinWidth, setOutputMinWidth] = useState(0);
  const [outputWidth, setOutputWidth] = useState("");
  const [outputHeight, setOutputHeight] = useState(0);
  const resultContainer = useRef<HTMLDivElement>(null);

  const result = useMemo(
    () => calcDpi(width, height, physical, dimension),
    [width, height, physical, dimension]
  );

  useEffect(() => {
    // Size the output to have the same aspect ratio as the screen
    const ratio = width / height;

    setOutputMinWidth(resultContainer.current!.offsetWidth);
    setOutputWidth(ratio > 1 ? "" : "10em");
    setOutputHeight(output.current!.offsetWidth / ratio);
  }, [width, height]);

  const reset = useCallback(() => {
    setWidth(currentScreen.width);
    setHeight(currentScreen.height);
  }, [currentScreen]);

  const resolutions = useMemo(
    () =>
      uniqBy(
        resolution
          .concat({
            w: currentScreen.width,
            h: currentScreen.height,
          })
          .sort((a, b) => b.w - a.w || b.h - a.h),
        ({ w, h }) => `${w}_${h}`
      ),
    [currentScreen]
  );

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    const hashRegex = /^#(\d+)[x×](\d+)(@(\d*\.?\d+)["″])?|(\d*\.?\d+)["″]$/;

    const onHashChange = () => {
      const hash = decodeURIComponent(location.hash);

      if (!hashRegex.test(hash)) return;
      const matches = hash.match(hashRegex);

      if (!matches) return;

      if (matches[1]) {
        setWidth(parseInt(matches[1]));
      }
      if (matches[2]) {
        setHeight(parseInt(matches[2]));
      }

      if (matches[3] || matches[5]) {
        if (matches[3]) {
          setPhysical(parseFloat(matches[4]));
        }
        if (matches[5]) {
          setPhysical(parseFloat(matches[5]));
        }
        setDimension(Dimension.d);
      }

      return true;
    };

    window.addEventListener("hashchange", onHashChange, false);
    onHashChange() || reset();
    return () => {
      window.removeEventListener("hashchange", onHashChange, false);
    };
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? devices.filter(
            screen =>
              screen.name.toLowerCase().includes(search.toLowerCase()) ||
              screen.d.toString().includes(search) ||
              screen.w.toString().includes(search) ||
              screen.h.toString().includes(search) ||
              screen.ppi?.toString().includes(search) ||
              screen.dppx?.toString().includes(search)
          )
        : devices,
    [devices, search]
  );

  return (
    <div
      className={css`
        a {
          color: slategray;
          @media (prefers-color-scheme: dark) {
            color: #ccc;
          }
        }
      `}
    >
      <header
        className={css`
          text-align: center;
        `}
      >
        <a
          href="./"
          className={css`
            text-decoration: none;
          `}
        >
          <h1
            className={css`
              align-items: center;
              color: red;
              display: flex;
              font-size: 300%;
              font-weight: 300;
              margin: 0 auto 20px;
              width: 244px;
            `}
          >
            <img
              src={logo}
              className={css`
                width: 90px;
                height: 83px;
                vertical-align: 10px;
              `}
            />
            <strong
              className={css`
                color: black;
                font-weight: bold;
                letter-spacing: -0.05em;
                @media (prefers-color-scheme: dark) {
                  color: white;
                }
              `}
            >
              dpi
            </strong>
            love
          </h1>
        </a>
      </header>
      <section
        className={css`
          display: grid;
          grid-template-columns: 1fr 1fr;
        `}
      >
        <div
          className={css`
            text-align: right;
            padding-right: 3%;
            border-right: 1px solid #eee;
            @media (prefers-color-scheme: dark) {
              border-right-color: #333;
            }
          `}
        >
          <div
            className={css`
              margin-bottom: 6px;
            `}
          >
            <label>Resolution:</label>
            <input
              id="width"
              type="number"
              value={width}
              onInput={e => setWidth(e.currentTarget.valueAsNumber)}
              className={css`
                width: 70px;
              `}
            />
            ×
            <input
              id="height"
              type="number"
              value={height}
              onInput={e => setHeight(e.currentTarget.valueAsNumber)}
              className={css`
                width: 70px;
              `}
            />
          </div>
          <div>
            Common:
            {resolutions.map(({ w, h }, i) => (
              <a
                key={i}
                href={`#${w}×${h}`}
                tabIndex={-1}
                onClick={() => {
                  setWidth(w);
                  setHeight(h);
                }}
                style={
                  w === currentScreen.width && h === currentScreen.height
                    ? { fontWeight: "bold" }
                    : undefined
                }
                className={css`
                  margin: 0 0.2em;
                  display: inline-block;
                `}
              >
                <span>{w}</span>×<span>{h}</span>
              </a>
            ))}
          </div>
        </div>

        <div
          className={css`
            text-align: left;
            padding-left: 3%;
            margin-left: -0.25em;
          `}
        >
          <div
            className={css`
              margin-bottom: 4px;
            `}
          >
            <select
              id="dimension"
              title="Physical dimension (in inches)"
              onChange={e => setDimension(e.currentTarget.value as any)}
              value={dimension}
            >
              <option value={Dimension.d}>Diagonal</option>
              <option value={Dimension.w}>Width</option>
              <option value={Dimension.h}>Height</option>
            </select>
            :
            <input
              id="physical"
              type="number"
              value={physical}
              onInput={e => setPhysical(e.currentTarget.valueAsNumber)}
              className={css`
                width: 70px;
              `}
            />
            ″
          </div>
          <div>
            Common diagonals:
            {diagonal.map((d, i) => (
              <a
                key={i}
                href={`#${d}″`}
                tabIndex={-1}
                onClick={() => setPhysical(d)}
                className={css`
                  margin: 0 0.2em;
                  display: inline-block;
                `}
              >
                {d}
              </a>
            ))}
          </div>
        </div>
      </section>

      <output
        ref={output}
        style={{
          minWidth: outputMinWidth,
          width: outputWidth,
          height: outputHeight,
        }}
        className={css`
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 10em;
          max-width: 100%;
          width: 15em;
          min-height: 8em;
          max-height: 20em;
          border: 15px solid transparent;
          border-radius: 12px;
          margin: 2em auto;
          background: linear-gradient(to bottom right, gray, black), url(${noise}),
            linear-gradient(to bottom right, #eee, #ccc);
          background-origin: padding-box, border-box, border-box;
          background-clip: padding-box, border-box, border-box;
          box-shadow: 1px 1px 3px black inset, 0 -1px white, 0 -1px 0 1px #bbb,
            0 2px 0 1px #aaa, 0 2px 10px 1px rgba(0, 0, 0, 0.2);
          color: white;
          text-shadow: 0 -1px 2px black;
          text-align: center;
          transition-duration: 0.3s;
          transition-property: width, height, line-height;

          @media (prefers-color-scheme: dark) {
            background-image: linear-gradient(to right bottom, #60686c, #000),
              url(${noise}), linear-gradient(to right bottom, #222426, #35393b);
            box-shadow: #000 1px 1px 3px inset, #181a1b 0px -1px, #3e4446 0px -1px 0px 1px,
              #484e51 0px 2px 0px 1px, rgba(0, 0, 0, 0.2) 0px 2px 10px 1px;
            color: #e8e6e3;
            text-shadow: #000 0px -1px 2px;
          }
        `}
      >
        <div
          ref={resultContainer}
          className={css`
            line-height: 1.1;
            margin-top: -1em;
          `}
        >
          <strong
            id="result"
            className={css`
              display: block;
              font-size: 400%;
              letter-spacing: -1px;
            `}
          >
            {result}
          </strong>
          pixels per inch
        </div>
      </output>

      <section
        className={css`
          margin-top: 20px;
          max-width: 32em;
          margin: 0 auto;
        `}
      >
        <input
          type="search"
          placeholder="Search…"
          id="search"
          autoComplete="off"
          value={search}
          onInput={e => setSearch(e.currentTarget.value)}
          className={css`
            appearance: none;
            display: block;
            width: 100%;
            padding: 0.2em 0 0.2em 1.5em;
            box-sizing: border-box;
            border-radius: 999px;
            font: inherit;
            background: url(${searchIcon}) no-repeat 0.3em 50% / 1em auto;
          `}
        />

        <div
          className={css`
            max-height: 16em;
            margin-top: 1em;
            overflow: auto;
          `}
        >
          <table
            className={css`
              width: 100%;
              border-spacing: 0;
              td,
              th {
                padding: 0.3em;
              }
              th:first-child {
                text-align: right;
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
                <th>Name</th>
                <th>Diagonal</th>
                <th>Resolution</th>
                <th
                  className={css`
                    border-radius: 0.3em 0.3em 0 0;
                  `}
                >
                  DPI
                </th>
                <th>dppx</th>
              </tr>
            </thead>
            <tbody>
              {!filtered.length && (
                <tr>
                  <td colSpan={5}>No Results</td>
                </tr>
              )}
              {filtered.map(screen => (
                <tr key={screen.name + screen.w}>
                  <th>
                    <a href={`#${screen.w}×${screen.h}@${screen.d}″`}>
                      <span>{screen.name}</span>
                    </a>
                  </th>
                  <td>
                    <span>{screen.d}</span>”
                  </td>
                  <td>
                    <span>{screen.w}</span>×<span>{screen.h}</span>
                  </td>
                  <td
                    className={css`
                      text-align: center;
                      font-variant-numeric: tabular-nums;
                    `}
                  >
                    {Math.round(
                      Math.sqrt(screen.w * screen.w + screen.h * screen.h) / screen.d
                    )}
                  </td>
                  <td>{screen.dppx ?? "?"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer
        className={css`
          text-align: center;
          padding-top: 1em;
          border-top: 1px solid #eee;
          margin-top: 1em;
          @media (prefers-color-scheme: dark) {
            border-top-color: #333;
          }
        `}
      >
        Forked from <a href="https://github.com/LeaVerou/dpi">dpi.lv</a> by{" "}
        <a href="http://lea.verou.me/">Lea Verou</a>.
      </footer>
    </div>
  );
}

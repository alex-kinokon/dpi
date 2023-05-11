import { css, cx } from "@emotion/css";
import { useEffect, useState } from "preact/hooks";
import { useMemo, useRef } from "react";
import logo from "./assets/logo.svg";
import noise from "./assets/noise.png";
import screens from "./assets/screens.json";
import * as devices from "./assets/devices.json";

const fieldSetClass = css`
  display: inline-block;
  vertical-align: top;
  width: 45%;
  padding: 0;
  border: none;
  margin: 0;
  font-weight: 300;

  p {
    font-size: 50%;
    opacity: 0.5;
    transition: 0.3s opacity;
    font-weight: normal;
  }
`;

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

export function App() {
  const [width, setWidth] = useState(screen.width);
  const [height, setHeight] = useState(screen.height);
  const [dimension, setDimension] = useState<Dimension>(Dimension.d);
  const [physical, setPhysical] = useState(13.3);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    const hashRegex = /^#(\d+)[x×](\d+)(@(\d*\.?\d+)["″])?|(\d*\.?\d+)["″]$/;

    const dppx =
      window.devicePixelRatio ||
      (window.matchMedia(
        "(min-resolution: 2dppx), (-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5)"
      ).matches
        ? 2
        : 1) ||
      1;

    setWidth(screen.width * dppx);
    setHeight(screen.height * dppx);

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
    };

    window.addEventListener("hashchange", onHashChange, false);
    onHashChange();
    return () => {
      window.removeEventListener("hashchange", onHashChange, false);
    };
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? screens.filter(
            screen =>
              screen.name.toLowerCase().includes(search.toLowerCase()) ||
              screen.d.toString().includes(search) ||
              screen.w.toString().includes(search) ||
              screen.h.toString().includes(search) ||
              screen.dpi?.toString().includes(search) ||
              screen.dppx?.toString().includes(search)
          )
        : screens,
    [search]
  );

  return (
    <div>
      <header>
        <h1
          className={css`
            margin-top: 0;
            font-size: 300%;
            font-weight: 300;
            color: red;
            text-align: center;
          `}
        >
          <img
            src={logo}
            className={css`
              width: 100px;
              height: 93px;
              margin-right: -25px;
              vertical-align: 10px;
            `}
          />
          <strong
            className={css`
              color: black;
              font-weight: bold;
              letter-spacing: -0.05em;
            `}
          >
            dpi
          </strong>
          love
        </h1>
      </header>
      <section>
        <fieldset
          className={cx(
            fieldSetClass,
            css`
              text-align: right;
              padding-right: 3%;
              border-right: 1px solid #eee;
            `
          )}
        >
          Resolution:
          <input
            id="width"
            type="number"
            value={width}
            onInput={e => setWidth(e.currentTarget.valueAsNumber)}
            className={css`
              width: 60px;
            `}
          />
          ×
          <input
            id="height"
            type="number"
            value={height}
            onInput={e => setHeight(e.currentTarget.valueAsNumber)}
            className={css`
              width: 60px;
            `}
          />
          <p id="resolutions">
            Common:
            {devices.resolution.map(({ w, h }, i) => (
              <a
                key={i}
                href={`#${w}×${h}`}
                tabIndex={-1}
                onClick={() => {
                  setWidth(w);
                  setHeight(h);
                }}
                className={css`
                  margin: 0 0.2em;
                `}
              >
                <span>{w}</span>×<span>{h}</span>
              </a>
            ))}
          </p>
        </fieldset>

        <fieldset
          className={cx(
            fieldSetClass,
            css`
              text-align: left;
              padding-left: 3%;
              margin-left: -0.25em;
            `
          )}
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
              width: 60px;
            `}
          />
          ″
          <p id="diagonals">
            Common diagonals:
            {devices.diagonal.map((d, i) => (
              <a
                key={i}
                href={`#${d}″`}
                tabIndex={-1}
                onClick={() => setPhysical(d)}
                className={css`
                  margin: 0 0.2em;
                `}
              >
                {d}
              </a>
            ))}
          </p>
        </fieldset>

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
            margin: 1em auto 0;
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
          `}
        >
          <div
            ref={resultContainer}
            className={css`
              display: inline-block;
              vertical-align: middle;
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
      </section>

      <section>
        <h1
          className={css`
            font-size: 200%;
            font-weight: 300;
            text-align: center;
          `}
        >
          Known screens
        </h1>
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
            padding: 0.1em 0 0 1.3em;
            box-sizing: border-box;
            border-radius: 999px;
            font: inherit;
            background: url(${search}) no-repeat 0.3em 50% / 1em auto;
          `}
        />

        <div
          id="devices"
          className={css`
            max-height: 19.8em;
            margin-top: 1em;
            overflow: auto;
            background: linear-gradient(white 30%, rgba(255, 255, 255, 0)),
              linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%,
              radial-gradient(
                farthest-side at 50% 0,
                rgba(0, 0, 0, 0.1),
                rgba(0, 0, 0, 0)
              ),
              radial-gradient(
                  farthest-side at 50% 100%,
                  rgba(0, 0, 0, 0.1),
                  rgba(0, 0, 0, 0)
                )
                0 100%;
            background-repeat: no-repeat;
            background-color: white;
            background-size: 100% 40px, 100% 40px, 100% 10px, 100% 10px;
            background-attachment: local, local, scroll, scroll;
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
                background: #fdd;
                text-shadow: 0 1px 1px white;
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
                  <td>
                    {screen.dpi ??
                      Math.round(
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
          margin-top: 2em;
        `}
      >
        Forked from <a href="https://github.com/LeaVerou/dpi">dpi.lv</a> by{" "}
        <a href="http://lea.verou.me/">Lea Verou</a>.
      </footer>

      <a href="http://github.com/LeaVerou/dpi">
        <img
          style="position: absolute; top: 0; left: 0; border: 0"
          src="https://github.com/usecue/fork-me-on-github-svg-ribbons/raw/master/images/forkme_left_red_aa0000.svg"
          alt="Fork me on GitHub"
        />
      </a>
    </div>
  );
}

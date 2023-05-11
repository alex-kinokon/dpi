import { css } from "@emotion/css";
import logo from "../assets/logo.svg";

export function Header() {
  return (
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
  );
}

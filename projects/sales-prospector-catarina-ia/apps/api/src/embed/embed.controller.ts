import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

@Controller("embed")
export class EmbedController {
  @Get("form.js")
  getScript(@Res() res: Response) {
    const script = `
      (function() {
        const form = document.createElement('form');
        form.innerHTML = '<input name="email" placeholder="Email" /><button>Subscribe</button>';
        form.onsubmit = (e) => {
          e.preventDefault();
          const email = form.querySelector('input').value;
          fetch('https://api.salesos.com/public/leads', {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: { 'Content-Type': 'application/json' }
          });
          alert('Thanks!');
        };
        document.body.appendChild(form);
      })();
    `;
    res.set("Content-Type", "application/javascript");
    res.send(script);
  }
}

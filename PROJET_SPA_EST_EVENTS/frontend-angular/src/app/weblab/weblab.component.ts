import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

interface ColorTile { color: string; label: string; matched: boolean; }

@Component({
  selector: 'app-weblab',
  templateUrl: './weblab.component.html',
  styleUrl: './weblab.component.scss'
})
export class WeblabComponent implements OnInit, AfterViewInit {
  @ViewChild('mainCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private lastDrawCommands: (() => void)[] = [];

  /* ── COLOR GAME ── */
  colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
  colorLabels = ['Rouge', 'Bleu', 'Vert', 'Orange', 'Violet'];
  sourceTiles: ColorTile[] = [];
  dropSlots: (string | null)[] = [null, null, null, null, null];
  draggedColor: string | null = null;
  gameScore = 0;
  gameComplete = false;
  shuffledColors: string[] = [];

  ngOnInit(): void {
    this.initGame();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.drawInitialCanvas();
  }

  /* ════════════════════════════════
     CANVAS API
  ════════════════════════════════ */
  private drawInitialCanvas(): void {
    this.clearCanvas();
    this.drawText();
  }

  clearCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.lastDrawCommands = [];
  }

  drawRect(): void {
    const colors = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 400 + 50;
    const y = Math.random() * 200 + 50;
    const w = Math.random() * 120 + 60;
    const h = Math.random() * 80 + 40;
    const angle = (Math.random() - 0.5) * 0.5;
    const cmd = () => {
      this.ctx.save();
      this.ctx.translate(x + w / 2, y + h / 2);
      this.ctx.rotate(angle);
      this.ctx.fillStyle = color + 'cc';
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(-w / 2, -h / 2, w, h);
      this.ctx.strokeRect(-w / 2, -h / 2, w, h);
      this.ctx.restore();
    };
    this.lastDrawCommands.push(cmd);
    cmd();
  }

  drawCircle(): void {
    const x = Math.random() * 450 + 50;
    const y = Math.random() * 220 + 40;
    const r = Math.random() * 60 + 30;
    const c1 = `hsl(${Math.random()*360},80%,60%)`;
    const c2 = `hsl(${Math.random()*360},80%,30%)`;
    const cmd = () => {
      const grad = this.ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = grad;
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff3';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    };
    this.lastDrawCommands.push(cmd);
    cmd();
  }

  drawText(): void {
    const cmd = () => {
      this.ctx.save();
      this.ctx.font = 'bold 36px "Segoe UI", sans-serif';
      this.ctx.textAlign = 'center';
      const grad = this.ctx.createLinearGradient(200, 0, 400, 0);
      grad.addColorStop(0, '#FFB300');
      grad.addColorStop(1, '#ffffff');
      this.ctx.fillStyle = grad;
      this.ctx.shadowColor = '#FFB300';
      this.ctx.shadowBlur = 15;
      this.ctx.fillText('EST Events 2025', 300, 175);
      this.ctx.font = '14px "Segoe UI", sans-serif';
      this.ctx.fillStyle = '#aaa';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText('Canvas API — Démonstration', 300, 200);
      this.ctx.restore();
    };
    this.lastDrawCommands.push(cmd);
    cmd();
  }

  redraw(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.lastDrawCommands.forEach(cmd => cmd());
  }

  /* ════════════════════════════════
     DRAG & DROP COLOR GAME
  ════════════════════════════════ */
  initGame(): void {
    this.shuffledColors = [...this.colors].sort(() => Math.random() - 0.5);
    this.sourceTiles = this.shuffledColors.map((color, i) => ({
      color, label: this.colorLabels[this.colors.indexOf(color)], matched: false
    }));
    this.dropSlots = [null, null, null, null, null];
    this.gameScore = 0;
    this.gameComplete = false;
  }

  onColorDragStart(e: DragEvent, color: string): void {
    this.draggedColor = color;
    e.dataTransfer?.setData('text/plain', color);
  }

  onSlotDragOver(e: DragEvent): void { e.preventDefault(); }

  onSlotDrop(e: DragEvent, index: number): void {
    e.preventDefault();
    const color = e.dataTransfer?.getData('text/plain') || this.draggedColor;
    if (!color || this.dropSlots[index] !== null) return;

    this.dropSlots[index] = color;
    const tile = this.sourceTiles.find(t => t.color === color);
    if (tile) tile.matched = true;

    if (color === this.colors[index]) {
      this.gameScore++;
    }
    this.gameComplete = this.dropSlots.every(s => s !== null);
  }

  removeFromSlot(index: number): void {
    const color = this.dropSlots[index];
    if (!color) return;
    this.dropSlots[index] = null;
    const tile = this.sourceTiles.find(t => t.color === color);
    if (tile) tile.matched = false;
    if (color !== this.colors[index]) {} else { this.gameScore--; }
    this.gameComplete = false;
  }

  getSlotTarget(index: number): string {
    return this.colors[index];
  }

  isCorrect(index: number): boolean {
    return this.dropSlots[index] === this.colors[index];
  }

  isWrong(index: number): boolean {
    return this.dropSlots[index] !== null && this.dropSlots[index] !== this.colors[index];
  }
}

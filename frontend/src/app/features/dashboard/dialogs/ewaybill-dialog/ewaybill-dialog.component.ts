import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-ewaybill-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, 
    MatIconModule, MatInputModule, MatFormFieldModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Manage E-Waybills</h2>
        <button mat-icon-button (click)="onNoClick()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-Waybill No. (12 digits)</mat-label>
          <input matInput [(ngModel)]="newBill" maxlength="12" inputmode="numeric" placeholder="Enter 12 digit number" (keyup.enter)="addBill()">
          <button mat-icon-button matSuffix [disabled]="newBill.length !== 12" (click)="addBill()" matTooltip="Add to list" color="primary" class="add-suffix-btn">
            <mat-icon>add_circle</mat-icon>
          </button>
          <mat-hint>12 digits only</mat-hint>
        </mat-form-field>

        <div class="bills-list">
          <div *ngIf="bills.length === 0" class="empty-state">
            No e-waybills added yet.
          </div>
          <div class="bill-item" *ngFor="let bill of bills; let i = index">
            <span class="bill-number">{{ bill }}</span>
            <button mat-icon-button color="warn" (click)="removeBill(i)" matTooltip="Remove">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onNoClick()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()">Save Changes</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 8px; min-width: 320px; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h2 { margin: 0; font-weight: 700; color: #1a2744; font-size: 18px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .add-suffix-btn { margin-right: -4px; }
    .bills-list { border: 1px solid #e2e8f0; border-radius: 8px; max-height: 250px; overflow-y: auto; background: #fff; margin-top: 16px; }
    .bill-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    .bill-item:last-child { border-bottom: none; }
    .bill-number { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; }
    .empty-state { padding: 32px 16px; text-align: center; color: #94a3b8; font-size: 14px; }
    .close-btn { background: #f1f5f9; }
    mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .delete-btn { color: #ef4444; }
  `]
})
export class EwaybillDialogComponent implements OnInit {
  bills: string[] = [];
  newBill: string = '';

  constructor(
    public dialogRef: MatDialogRef<EwaybillDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bills: string[] }
  ) {}

  ngOnInit() {
    this.bills = [...(this.data.bills || [])];
  }

  addBill() {
    if (this.newBill.length === 12 && !this.bills.includes(this.newBill)) {
      this.bills.push(this.newBill);
      this.newBill = '';
    }
  }

  removeBill(index: number) {
    this.bills.splice(index, 1);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    this.dialogRef.close(this.bills);
  }
}

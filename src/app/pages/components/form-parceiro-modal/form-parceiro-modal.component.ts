import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormUsuarioParceiroService } from '../../../services/form-usuario-parceiro.service';
import { AuthService } from '../../../services/auth.service';
import { NgxMaskDirective } from 'ngx-mask';
import { ParceiroStatusService } from '../../../services/parceiro-status.service';

@Component({
  selector: 'app-form-parceiro-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    NgxMaskDirective,
  ],
  templateUrl: './form-parceiro-modal.component.html',
  styleUrls: ['./form-parceiro-modal.component.css'],
})
export class FormParceiroModalComponent implements OnInit {
  partnerForm!: FormGroup;

  @Output() formCompleted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FormParceiroModalComponent>,
    private formParceiroService: FormUsuarioParceiroService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private parceiroStatusService: ParceiroStatusService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.partnerForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.maxLength(100)]],
      cpf: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
        ],
      ],
      telefone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{2}\)\s(\d{4,5})-\d{4}$/),
        ],
      ],
    });
  }

  get f() {
    return this.partnerForm.controls;
  }

  onSubmit(): void {
    if (this.partnerForm.invalid) {
      this.partnerForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, preencha todos os campos obrigatórios corretamente.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    const formData = this.partnerForm.value;
    formData.cpf = formData.cpf.replace(/\D/g, '');
    formData.telefone = formData.telefone.replace(/\D/g, '');

    this.formParceiroService.submitPartnerForm(formData).subscribe({
      next: (response) => {
        this.snackBar.open(
          'Cadastro de parceiro enviado para aprovação!',
          'Fechar',
          { duration: 3000 }
        );
        this.formCompleted.emit();
        this.parceiroStatusService.clearCache();
        this.dialogRef.close();
      },
      error: (error) => {
        console.error('Erro ao enviar formulário de parceiro:', error);
        const errorMessage =
          error.error?.mensagem ||
          'Erro ao enviar o formulário. Tente novamente.';
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      },
    });
  }

  formatCpf(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
    }

    input.value = value;
    this.partnerForm.get('cpf')?.setValue(value, { emitEvent: false });
  }

  onClose(): void {
    this.closed.emit();
    this.dialogRef.close();
  }
}

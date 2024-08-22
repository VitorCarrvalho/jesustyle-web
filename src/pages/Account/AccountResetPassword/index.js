import React, { useState } from 'react';
import './account-reset-password.scss'; // Importa o arquivo de estilo


export default function AccountResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Verifica se as senhas correspondem
    if (newPassword !== confirmPassword) {
      alert("As senhas não correspondem!");
      return;
    }

    const requestPayload = {
      Senha: newPassword, // Payload para redefinir a senha
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.jesustyleoficial.com.br/usuario/recuperar-senha', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao redefinir a senha');
      }

      const responseData = await response.json();
      console.log("Senha redefinida com sucesso!", responseData);
      alert("Senha redefinida com sucesso!");
    } catch (error) {
      console.error("Erro ao redefinir a senha:", error);
      alert("Erro ao redefinir a senha.");
    }
  };

  return (
    <article>
      <h2>Redefinir Senha</h2>
      <form onSubmit={handleResetPassword}>
        <div>
          <label>Nova Senha:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite sua nova senha"
            required
          />
        </div>
        <div>
          <label>Repita a Nova Senha:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita sua nova senha"
            required
          />
        </div>
        <div className="container-button">
          <button type="submit">Redefinir Senha</button>
        </div>
      </form>
    </article>
  );
}

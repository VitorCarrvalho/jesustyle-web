import React, { useState, useEffect } from "react";
import '../account.scss';
import { useNavigate } from 'react-router-dom'; // Para redirecionamento

export default function AccountDetails() {
    const [userDetails, setUserDetails] = useState({
        fullName: '',
        email: '',
        birthday: '',
        cpf: '',
        phone: '',
        password:'',
        tipoUsuario: '' // Armazena o tipo de usuário (Admin ou User)
    });

    const [formattedDetails, setFormattedDetails] = useState({
        cpf: '',
        phone: ''
    });

    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const navigate = useNavigate(); // Para redirecionamento

    useEffect(() => {
        async function fetchUserDetails() {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirecionar se não houver token
                navigate('/login'); // Ou para a página desejada
                return;
            }
            const codigo = localStorage.getItem('codigo');
            try {
                //const response = await fetch('https://api.jesustyleoficial.com.br/usuarios/buscar/'
                const response = await fetch('http://localhost:8082/usuarios/buscar/'+ codigo, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Dados do usuário:", data); // Verifique os dados aqui
                    setUserDetails({
                        fullName: data.nome,
                        email: data.email,
                        birthday: data.dataNascimento.slice(0, 10),
                        cpf: data.cpf || '',
                        phone: data.telefone || '',
                        tipoUsuario: data.tipoUsuario || '' // Corrigido para usar tipoUsuario
                    });

                    setFormattedDetails({
                        cpf: formatCpf(data.cpf),
                        phone: formatPhone(data.telefone)
                    });
                } else {
                    const errorData = await response.json();
                    console.error("Erro ao obter detalhes do usuário:", errorData);
                }
            } catch (error) {
                console.error("Erro ao fazer a requisição:", error);
            }
        }

        fetchUserDetails();
    }, [navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUserDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));

        if (name === 'cpf') {
            setFormattedDetails(prev => ({ ...prev, cpf: formatCpf(value) }));
        } else if (name === 'phone') {
            setFormattedDetails(prev => ({ ...prev, phone: formatPhone(value) }));
        }
    };

    const formatCpf = (value) => {
        return value.replace(/\D/g, '')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const formatPhone = (value) => {
        return value.replace(/\D/g, '')
                    .replace(/(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{5})(\d)/, '$1-$2');
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const cleanUserDetails = {
            ...userDetails,
            cpf: userDetails.cpf.replace(/[^\d]/g, ''),
            phone: userDetails.phone.replace(/[^\d]/g, '')
        };

        const requestPayload = {
            Codigo: localStorage.getItem('codigo'),
            Nome: cleanUserDetails.fullName,
            DataNascimento: cleanUserDetails.birthday ? new Date(cleanUserDetails.birthday) : null,
            CPF: cleanUserDetails.cpf,
            Telefone: cleanUserDetails.phone,
            Senha: cleanUserDetails.password
        };

        try {
            //const response = await fetch('https://api.jesustyleoficial.com.br/usuarios/update'
            const response = await fetch('http://localhost:8082/usuarios/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar alterações');
            }

            const responseData = await response.json();
            console.log("Detalhes atualizados com sucesso!", responseData);
            
            setSuccessMessage('Usuário editado com sucesso!');
            setErrorMessage('');

        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            setErrorMessage('Erro ao salvar alterações.'); // Mensagem de erro
            setSuccessMessage('');
        }
    };

    return (
        <article>
            <h2>Detalhes da Conta</h2>
            <span>{userDetails.email} <p>{userDetails.tipoUsuario === 'Admin' ? 'Administrador' : 'Membro'}</p></span>
            <form onSubmit={handleSave}>
                <div>
                    <label>Nome completo:</label>
                    <input
                        type="text"
                        name="fullName"
                        value={userDetails.fullName}
                        onChange={handleChange}
                        placeholder="Digite seu nome completo"
                        required
                    />
                </div>
                <div>
                    <label>Data de nascimento:</label>
                    <input
                        type="date"
                        name="birthday"
                        value={userDetails.birthday}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>CPF:</label>
                    <input
                        type="text"
                        name="cpf"
                        value={formattedDetails.cpf}
                        onChange={handleChange}
                        placeholder="Digite seu CPF"
                        required
                    />
                </div>
                <div>
                    <label>Telefone:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formattedDetails.phone}
                        onChange={handleChange}
                        placeholder="(**) *****-****"
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Digite sua senha (se necessário)"
                    />
                </div>
                <div className="container-button">
                    <button type="submit">Salvar alterações</button>
                </div>
            </form>
            
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

          
        </article>
    );
}
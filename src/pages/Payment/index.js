import React, { useEffect, useState } from 'react';
import './payment.scss';
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, Spinner } from "@chakra-ui/react";
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CustomModal from '../../components/CustomModal';
import pagarme from '../../assets/seloPagarX.png';
import { FaAngleRight } from "react-icons/fa";
import { BsFillCreditCardFill, BsFillPersonPlusFill } from 'react-icons/bs';
import 'core-js/stable';
import { useOpenPix } from '@openpix/react';
import QRCode from 'qrcode.react';

const Payment = () => {
  const [cupom, setCupom] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [botaoTexto, setBotaoTexto] = useState('Validar');
  const [botaoCor, setBotaoCor] = useState('');
  const botaoClassName = botaoCor === 'green' ? 'botao-validar' : (botaoCor === 'red' ? 'botao-remover' : '');
  const [loading, setLoading] = useState(true);
  const [estimativaEntrega, setEstimativaEntrega] = useState('');
  const [loadingButton, setLoadingButton] = useState(false);
  const [pixPaymentUrl, setPixPaymentUrl] = useState('');
  const [isOpenModalSuccess, setIsOpenModalSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [cpfOrCnpj, setCpfOrCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [residentialNumber, setResidentialNumber] = useState('');
  const [street, setStreet] = useState('');
  const [addressData, setAddressData] = useState({});
  const [cart, setCart] = useState([]);
  const [frete, setFrete] = useState(0);
  const [personType, setPersonType] = useState('individual');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [qrCodeImage, setQrCodeImage] = useState('');


  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(cartItems);
      } catch (error) {
        console.error('Erro ao carregar o carrinho:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    document.title = 'Jesustyle | Finalizar Compra';
  }, []);

  const fetchFrete = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (!cleanCep || cleanCep.length !== 8) return;

    try {
      const url = 'http://localhost:8082/transporte/simular';
      const total = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

      const requestBody = {
        cepOrigem: '06509012',
        cepDestino: cleanCep,
        vlrMerc: total,
        pesoMerc: 1.0,
        volumes: [{
          peso: 1.0,
          altura: 0.30,
          largura: 0.30,
          comprimento: 0.30,
          tipo: '',
          valor: total,
          quantidade: 1,
        }],
        produtos: [{
          peso: 1.0,
          altura: 0.30,
          largura: 0.30,
          comprimento: 0.30,
          valor: total,
          quantidade: 1,
        }],
        servicos: ['E', 'X'],
        ordernar: 'preco',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const { vlrFrete, prazoEnt } = data;
      setFrete(vlrFrete);
      setEstimativaEntrega(prazoEnt);
    } catch (error) {
      console.error('Erro ao calcular o frete:', error);
      toast.error(`Erro ao calcular o frete: ${error.message}`);
    }
  };

  const fetchAddressData = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos.');
    }

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (response.data && !response.data.erro) {
        return response.data;
      } else {
        throw new Error('CEP não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do endereço:', error);
      toast.error('Erro ao buscar dados do endereço. Tente novamente.');
      throw error;
    }
  };

  useEffect(() => {
    const fetchAndSetAddress = async () => {
      if (cep.length === 8 && residentialNumber) {
        try {
          const addressData = await fetchAddressData(cep);
          setStreet(`${addressData.logradouro}, ${residentialNumber}, ${addressData.localidade}/${addressData.uf} - ${cep}`);
          fetchFrete();
        } catch (error) {
          setStreet('');
        }
      }
    };

    fetchAndSetAddress();
  }, [cep, residentialNumber]);

  const total = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const formatPrice = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCardNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setCardName(value);
  };

  const emailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
  };

  const formatCardNumber = (number) => {
    return number.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const handleCardNumberChange = (e) => {
    const value = formatCardNumber(e.target.value);
    setCardNumber(value);
  };

  const formatExpiryDate = (expiryDate) => {
    return expiryDate.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
  };

  const handleExpiryDateChange = (e) => {
    const value = formatExpiryDate(e.target.value);
    setExpiryDate(value);
  };

  const formatCvv = (cvv) => {
    return cvv.replace(/\D/g, '').slice(0, 4);
  };

  const handleCvvChange = (e) => {
    const value = formatCvv(e.target.value);
    setCvv(value);
  };

  const formatPhone = (phone) => {
    return phone.replace(/\D/g, '').replace(/^(\d{2})(\d{1,5})(\d{1,4})$/, '($1) $2-$3').trim();
  };

  const handlePhoneChange = (e) => {
    const value = formatPhone(e.target.value);
    setPhone(value);
  };

  const isValidCardName = (name) => name.trim() !== '';

  const isValidCardNumber = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    const cardNumberRegex = /^\d{13,19}$/;
    return cardNumberRegex.test(cleanNumber);
  };

  const isValidExpiryDate = (expiryDate) => {
    const [month, year] = expiryDate.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    return !(month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth));
  };

  const isValidCvv = (cvv) => /^\d{3,4}$/.test(cvv);

  const handleInstallmentsChange = (e) => {
    setInstallments(e.target.value);
  };

  useEffect(() => {
    setCpfOrCnpj('');
  }, [personType]);

  const isValidCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;

    const validate = (number, factor) => {
      let sum = 0;

      for (let i = 0; i < factor; i++) {
        sum += number[i] * (factor + 1 - i);
      }

      const rest = (sum * 10) % 11;

      return rest === number[factor];
    };

    const cpfArray = cpf.split('').map(Number);
    return validate(cpfArray, 9) && validate(cpfArray, 10);
  };

  const isValidCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14) return false;

    const validate = (number, factor) => {
      let sum = 0;

      for (let i = 0; i < factor; i++) {
        sum += number[i] * (factor + 1 - i);
      }

      const rest = sum % 11;

      return rest < 2 ? 0 : 11 - rest === number[factor];
    };

    const cnpjArray = cnpj.split('').map(Number);
    return validate(cnpjArray, 12) && validate(cnpjArray, 13);
  };

  const handlePayment = async () => {
    // Validações
    if (!cardName || !cardNumber || !expiryDate || !cvv || !installments || !cpfOrCnpj || !email || !phone || !cep || !residentialNumber) {
      toast.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoadingButton(true);

    const total = calculateTotal(); // Calcule o total uma vez

    if (!cart || cart.length === 0) {
      toast.error('Seu carrinho está vazio.');
      setLoadingButton(false);
      return;
    }

    if (paymentMethod === 'pix') {
      await handlePixPayment(total);
    } else {
      await handleCreditCardPayment(total);
    }

    setLoadingButton(false);
  };

  const calculateTotal = () => {
    return cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) + (frete || 0);
  };

  const handleCreditCardPayment = async (total) => {
    const paymentData = {
      items: cart.map(product => ({
        amount: product.price * 100,
        description: product.name,
        quantity: product.quantity,
        code: "CAMISETACODE"
      })),
      customer: {
        name: cardName,
        email: email,
        document: cpfOrCnpj.replace(/\D/g, ""),
        type: personType,
        phones: {
          home_phone: {
            country_code: "55",
            area_code: phone.substring(1, 3),
            number: phone.replace(/\D/g, '')
          }
        }
      },
      payments: [{
        payment_method: "credit_card",
        credit_card: {
          installments: parseInt(installments),
          statement_descriptor: "LJJESUSTYLE",
          card: {
            number: cardNumber.replace(/\D/g, ''),
            holder_name: cardName,
            exp_month: parseInt(expiryDate.substring(0, 2)),
            exp_year: parseInt(expiryDate.substring(3, 5)) + 2000,
            cvv: cvv,
            billing_address: {
              line_1: `${street}`,
              zip_code: cep.replace(/\D/g, ''),
              city: '', // Você precisa fornecer a cidade
              state: '', // Você precisa fornecer o estado
              country: "BR"
            }
          }
        }
      }]
    };

    try {
      const response = await axios.post('/core/v5/orders', paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'sk_test_4e27008e14c24164bad6e7fdbfdd9dee'
        }
      });

      if (response.data.status !== 'paid') {
        const errorMessages = response.data.errors?.payments.map(err => err[0]).join(', ') || 'Erro ao processar pagamento. Tente novamente.';
        toast.error(errorMessages);
        return;
      }

      setIsOpenModalSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 4000));
      localStorage.removeItem("cart");
      // navigate('/products'); // Descomente se estiver usando react-router

    } catch (error) {
      console.error('Erro ao processar pagamento:', error.response ? error.response.data : error.message);
      toast.error('Erro ao processar pagamento. Tente novamente mais tarde.');
    }
  };
  const handlePixPayment = async (total) => {
    const correlationID = `ID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pixPayload = {
      correlationID,
      value: total * 100,
      comment: 'Pagamento da compra',
    };

    try {
      const response = await axios.post('https://api.openpix.com.br/api/v1/charge', pixPayload, {
        headers: {
          'Authorization': 'Q2xpZW50X0lkXzgwMWRmMzgwLWRjOWItNDEzOS04YzRmLTAxNWFkNDA2MGNhZjpDbGllbnRfU2VjcmV0X1BEYU55S2ZGbklhVEZ1dGVraEZEUjJlNFBMWlRlZjF1Vmc0b1EwUTNyOEU9',
          'Content-Type': 'application/json',
        },
      });

      const charge = response.data.charge;
      setQrCodeImage(charge.qrCodeImage); // Atualiza o estado com a URL do QR Code
      setPixPaymentUrl(charge.paymentLinkUrl); // Se necessário, mantenha a URL de pagamento
      toast.success('QR Code gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar a cobrança Pix:', error);
      toast.error('Erro ao gerar QR Code. Tente novamente.');
    }
  };



  return (
    <>
      <Header />
      <main className='payment'>
        <Breadcrumb className="breadcrumb" spacing="8px" separator={<FaAngleRight />}>
          <BreadcrumbItem className="breadcrumb-item">
            <Link to={`/products`}>Produtos</Link>
          </BreadcrumbItem>
          <BreadcrumbItem className="breadcrumb-item">
            <Link to={`/product/1`}>Detalhes do Produto</Link>
          </BreadcrumbItem>
          <BreadcrumbItem className="breadcrumb-item">
            <Link className="active">Finalização da Compra</Link>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className='payment-container'>
          <section className='checkout-section'>
            <h1>Finalizar compra</h1>
            <form className='payment-form'>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '48%' }}>
                <label htmlFor="cardName">Nome no cartão:</label>
                <input type="text" id="cardName" maxLength="19" placeholder="Nome no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '50%' }}>
                <label htmlFor="cardNumber">Número do Cartão:</label>
                <input type="text" id="cardNumber" placeholder="Número do Cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '32%' }}>
                <label htmlFor="expiryDate">Data de Validade:</label>
                <input type="text" id="expiryDate" placeholder="MM/AA" maxLength="5" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '32%' }}>
                <label htmlFor="cvv">CVV:</label>
                <input type="text" id="cvv" maxLength="4" placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '32%' }}>
                <label htmlFor="installments">Número de parcelas:</label>
                <select id="installments" value={installments} onChange={(e) => setInstallments(e.target.value)}>
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((num) => (
                    <option key={num}>{num} X de R${(total / num).toFixed(2).replace('.', ',')}</option>
                  ))}
                </select>
              </div>

              <section className='additional-details'>
                <h5><BsFillPersonPlusFill /> Dados complementares</h5>
              </section>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '48%' }}>
                <label>Tipo de Pessoa:</label>
                <select id="personType" value={personType} onChange={(e) => setPersonType(e.target.value)}>
                  <option value="individual">Pessoa Física</option>
                  <option value="legal_entity">Pessoa Jurídica</option>
                </select>
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '48%' }}>
                <label>{personType === 'individual' ? 'CPF:' : 'CNPJ:'}</label>
                <input type="text" placeholder={personType === 'individual' ? 'CPF' : 'CNPJ'} maxLength={personType === 'individual' ? "11" : "14"} value={cpfOrCnpj} onChange={(e) => setCpfOrCnpj(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '48%' }}>
                <label>Email:</label>
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '34%' }}>
                <label>Telefone:</label>
                <input type="tel" placeholder="(**) *****-****" maxLength={15} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '34%' }}>
                <label>CEP:</label>
                <input type="text" placeholder="CEP" maxLength={9} value={cep} onChange={(e) => setCep(e.target.value)} />
              </div>
              <div style={{ width: window.innerWidth <= 480 ? '100%' : '26%' }}>
                <label>Nº residencial:</label>
                <input type="text" placeholder="Nº residencial" maxLength={9} value={residentialNumber} onChange={(e) => setResidentialNumber(e.target.value)} />
              </div>
            </form>
          </section>

          <section className='purchase-details'>
            <h1>Resumo da Compra</h1>
            {street && (<p className="purchase-details-p">Local de Entrega: <span>{street}</span></p>)}
            <p className='purchase-details-p'><span></span></p>
            <aside className="product-body">
              <ul>
                {cart.map(product => (
                  <li key={product.id}>
                    <img src={product.src} alt={product.name} />
                    <div className='details'>
                      <p>{product.name}</p>
                      <p>Quantidade: {product.quantity}</p>
                      <p>Tamanho: {product.size}</p>
                      <p>{formatPrice(product.price * product.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
            <p className='purchase-details-p'>Parcelamento: <span>{installments}</span></p>
            <p className='purchase-details-p' style={{ display: 'flex', justifyContent: 'space-between' }}>Total: <span>{formatPrice(total)}</span></p>
            <p className='purchase-details-p' style={{ display: 'flex', justifyContent: 'space-between' }}>Frete: <span>{formatPrice(frete || 0)}</span></p>

            <img className='purchase-details-img' src={pagarme} alt="Pagar.me" />
            <div>
              <label>
                <input
                  type='checkbox'
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                Ao marcar esta opção, você concorda com os <a href='#'>Termos de Serviço</a>.
              </label>
            </div>
            <button
              type='button'
              onClick={handleCreditCardPayment}
              disabled={loadingButton}
              className="spacing"
            >
              {loadingButton ? <Spinner className="spinner-button" speed='0.70s' /> : 'Finalizar Compra'}
            </button>

            <h1 style={{ marginBottom: '16px' }}>OpenPix </h1>  <h6>Gerar QR Code</h6>

            <button
              type="button"
              onClick={() => {
                if (pixPaymentUrl) {
                  window.open(pixPaymentUrl, "_blank");
                } else {
                  setPaymentMethod('pix');
                  handlePixPayment(total); // Gera o QR Code com o total
                }
              }}
              disabled={loadingButton}
              className="spacing"
            >
              {pixPaymentUrl ? 'Ver QR Code' : 'Pagar com Pix - Gerar QR Code'}
            </button>



          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Payment;
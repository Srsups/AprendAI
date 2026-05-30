"""
Serviço de envio de emails via Resend.
"""
import logging
import resend
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _init_resend():
    settings = get_settings()
    resend.api_key = settings.resend_api_key


def _base_template(title: str, body: str, cta_url: str, cta_label: str) -> str:
    """Template HTML base com o visual do AprendAI."""
    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a08;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#111110;border:1px solid #2a2a26;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#111110;padding:32px 40px 24px;border-bottom:2px solid #c8f060;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#c8f060;letter-spacing:-0.5px;">
                AprendAI
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#e8e8e2;line-height:1.3;">
                {title}
              </h1>
              <div style="font-size:15px;color:#a0a090;line-height:1.7;">
                {body}
              </div>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
                <tr>
                  <td>
                    <a href="{cta_url}"
                      style="display:inline-block;background:#c8f060;color:#0a0a08;
                             font-size:14px;font-weight:700;padding:14px 28px;
                             border-radius:10px;text-decoration:none;letter-spacing:-0.2px;">
                      {cta_label}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;color:#6b6b60;">
                Se você não solicitou isso, ignore este email com segurança.
                O link expira em <strong style="color:#a0a090;">1 hora</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a26;">
              <p style="margin:0;font-size:11px;color:#6b6b60;">
                © 2025 AprendAI · Motor de Aprendizado com IA
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_password_reset_email(to_email: str, user_name: str, reset_url: str) -> bool:
    """Envia o email de recuperação de senha."""
    _init_resend()
    settings = get_settings()

    body = f"""
      <p>Olá, <strong style="color:#e8e8e2;">{user_name}</strong>!</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no AprendAI.</p>
      <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong style="color:#e8e8e2;">1 hora</strong>.</p>
    """

    html = _base_template(
        title     = "Redefinir sua senha",
        body      = body,
        cta_url   = reset_url,
        cta_label = "Redefinir senha",
    )

    try:
        resend.Emails.send({
            "from"   : f"AprendAI <{settings.resend_from_email}>",
            "to"     : [to_email],
            "subject": "Redefinição de senha — AprendAI",
            "html"   : html,
        })
        logger.info(f"[Email] Reset enviado para {to_email}")
        return True
    except Exception as e:
        logger.error(f"[Email] Erro ao enviar para {to_email}: {e}")
        return False


async def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Email de boas-vindas após cadastro."""
    _init_resend()
    settings = get_settings()

    body = f"""
      <p>Olá, <strong style="color:#e8e8e2;">{user_name}</strong>! 🎉</p>
      <p>Sua conta no <strong style="color:#e8e8e2;">AprendAI</strong> foi criada com sucesso.</p>
      <p>Agora você pode gerar planos de estudo personalizados com IA, fazer quizzes e criar flashcards para qualquer assunto.</p>
      <p>Comece agora mesmo clicando no botão abaixo.</p>
    """

    html = _base_template(
        title     = "Bem-vindo ao AprendAI!",
        body      = body,
        cta_url   = f"{settings.frontend_url}/dashboard",
        cta_label = "Começar a aprender",
    )

    try:
        resend.Emails.send({
            "from"   : f"AprendAI <{settings.resend_from_email}>",
            "to"     : [to_email],
            "subject": "Bem-vindo ao AprendAI 🎉",
            "html"   : html,
        })
        logger.info(f"[Email] Boas-vindas enviado para {to_email}")
        return True
    except Exception as e:
        logger.error(f"[Email] Erro ao enviar para {to_email}: {e}")
        return False
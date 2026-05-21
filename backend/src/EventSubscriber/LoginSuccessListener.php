<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use Symfony\Component\HttpFoundation\Cookie;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;

class LoginSuccessListener implements EventSubscriberInterface
{
    public function __construct(
        private JWTTokenManagerInterface $jwtManager
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            LoginSuccessEvent::class => 'onLoginSuccess',
        ];
    }

    public function onLoginSuccess(LoginSuccessEvent $event): void
    {
        $user = $event->getUser();
        
        if (!$user instanceof \App\Entity\User) {
            return;
        }

        // Generate access token (short-lived: 15 minutes)
        $accessToken = $this->jwtManager->create($user);

        // Generate refresh token (long-lived: 7 days)
        // Note: In a production app, you should store refresh tokens in database
        $refreshToken = bin2hex(random_bytes(32));

        // Create HTTP-Only cookie for access token
        $accessCookie = new Cookie(
            'BEARER_TOKEN',           // Cookie name
            $accessToken,             // Token value
            time() + (15 * 60),       // Expiration: 15 minutes
            '/',                      // Path
            null,                     // Domain (null = current domain)
            true,                     // Secure (true for HTTPS only)
            true,                     // HTTP-Only (JavaScript cannot access)
            false,                    // Raw
            'Lax'                     // SameSite
        );

        // Create HTTP-Only cookie for refresh token
        $refreshCookie = new Cookie(
            'REFRESH_TOKEN',          // Cookie name
            $refreshToken,            // Token value
            time() + (7 * 24 * 3600), // Expiration: 7 days
            '/api/refresh-token',     // Path (only sent to refresh endpoint)
            null,                     // Domain
            true,                     // Secure
            true,                     // HTTP-Only
            false,                    // Raw
            'Lax'                     // SameSite
        );

        // Add cookies to response
        $response = $event->getResponse();
        $response->headers->setCookie($accessCookie);
        $response->headers->setCookie($refreshCookie);

        // Remove token from response body (we don't want to expose it in JSON)
        $content = json_decode($response->getContent(), true);
        if (isset($content['token'])) {
            unset($content['token']);
        }
        $response->setContent(json_encode($content));
    }
}

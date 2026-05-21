<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use Symfony\Component\HttpFoundation\Cookie;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

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

        // Generate JWT token
        $token = $this->jwtManager->create($user);

        // Create HTTP-Only cookie with the token
        $cookie = new Cookie(
            'BEARER_TOKEN',           // Cookie name
            $token,                   // Token value
            time() + (24 * 3600),     // Expiration: 24 hours
            '/',                      // Path
            null,                     // Domain (null = current domain)
            true,                     // Secure (true for HTTPS only)
            true,                     // HTTP-Only (JavaScript cannot access)
            false,                    // Raw
            'Lax'                     // SameSite
        );

        // Add cookie to response
        $response = $event->getResponse();
        $response->headers->setCookie($cookie);

        // Remove token from response body (we don't want to expose it in JSON)
        $content = json_decode($response->getContent(), true);
        if (isset($content['token'])) {
            unset($content['token']);
        }
        $response->setContent(json_encode($content));
    }
}

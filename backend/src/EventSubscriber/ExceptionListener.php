<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTExpiredException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\InvalidTokenException;

class ExceptionListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ExceptionEvent::class => 'onKernelException',
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        // Handle JWT authentication exceptions
        if ($exception instanceof AuthenticationException 
            || $exception instanceof JWTDecodeFailureException
            || $exception instanceof JWTExpiredException
            || $exception instanceof InvalidTokenException) {
            
            $response = new JsonResponse([
                'error' => 'Invalid or expired token',
                'message' => $exception->getMessage()
            ], 401);

            // Clear the invalid cookie
            $response->headers->clearCookie('BEARER_TOKEN');
            
            $event->setResponse($response);
        }
    }
}

<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        SerializerInterface $serializer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'], $data['firstName'], $data['lastName'])) {
            return new JsonResponse(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $errors = $validator->validate($user, null, ['register']);
        if (count($errors) > 0) {
            return new JsonResponse(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        // Check if user already exists
        $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $user->getEmail()]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email already registered'], Response::HTTP_CONFLICT);
        }

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'User created successfully',
            'user' => $serializer->normalize($user, 'json', ['groups' => ['user:read']])
        ], Response::HTTP_CREATED);
    }

    #[Route('/me', methods: ['GET'])]
    public function me(SerializerInterface $serializer): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'user' => $serializer->normalize($user, 'json', ['groups' => ['user:read']])
        ]);
    }

    #[Route('/logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // Clear the cookies by setting expiration in the past
        $response = new JsonResponse(['message' => 'Logged out successfully']);
        $response->headers->clearCookie('BEARER_TOKEN');
        $response->headers->clearCookie('REFRESH_TOKEN');
        
        return $response;
    }

    #[Route('/refresh-token', methods: ['POST'])]
    public function refreshToken(
        Request $request,
        JWTTokenManagerInterface $jwtManager,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Get refresh token from cookie
        $refreshToken = $request->cookies->get('REFRESH_TOKEN');

        if (!$refreshToken) {
            return new JsonResponse(['error' => 'Refresh token not found'], Response::HTTP_UNAUTHORIZED);
        }

        // In a production app, you should validate the refresh token against the database
        // For now, we'll just generate a new access token for the current user
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Invalid refresh token'], Response::HTTP_UNAUTHORIZED);
        }

        // Generate new access token
        $newAccessToken = $jwtManager->create($user);

        // Create new access token cookie
        $accessCookie = new Cookie(
            'BEARER_TOKEN',
            $newAccessToken,
            time() + (15 * 60),       // Expiration: 15 minutes
            '/',
            null,
            true,                     // Secure
            true,                     // HTTP-Only
            false,
            'Lax'
        );

        // Optionally rotate refresh token
        $newRefreshToken = bin2hex(random_bytes(32));
        $refreshCookie = new Cookie(
            'REFRESH_TOKEN',
            $newRefreshToken,
            time() + (7 * 24 * 3600), // Expiration: 7 days
            '/api/refresh-token',
            null,
            true,
            true,
            false,
            'Lax'
        );

        $response = new JsonResponse([
            'message' => 'Token refreshed successfully'
        ]);
        $response->headers->setCookie($accessCookie);
        $response->headers->setCookie($refreshCookie);

        return $response;
    }
}

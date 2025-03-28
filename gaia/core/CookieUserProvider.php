<?php
namespace Core;

use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class CookieUserProvider implements UserProviderInterface
{
    private $db;

    public function __construct()
    {

    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $user = $this->db->f("SELECT * FROM user WHERE id = ?", [$identifier]);

        if (!$user) {
            throw new UserNotFoundException();
        }

        // Create a temporary object that uses the Core\My trait
        $userEntity = new class() implements UserInterface {
            use My;

            private $id;
            private $email;
            private $pass;
            private $usergrpid;

            public function __construct($db) {
                $this->db = $db;
            }

            public function setId($id): void {
                $this->id = $id;
            }

            public function setEmail($email): void {
                $this->email = $email;
            }

            public function setPassword($pass): void {
                $this->pass = $pass;
            }

            public function setUsergrpid($usergrpid): void {
                $this->usergrpid = $usergrpid;
            }

            public function getId(): ?int
            {
                return $this->id;
            }

            public function getEmail(): ?string
            {
                return $this->email;
            }

            public function getPassword(): ?string
            {
                return $this->pass;
            }

            public function getUsergrpid(): ?int
            {
                return $this->usergrpid;
            }

            public function getRoles(): array
            {
                $roles = $this->getRoles();
                if ($roles['success']) {
                  return [$roles['data']['name']];
                }
                return ['ROLE_USER'];
            }

            public function getSalt(): ?string
            {
                return null; // Not using salt
            }

            public function eraseCredentials()
            {
                // If you store any temporary, sensitive data on the user, clear it here
                // $this->plainPassword = null;
            }

            public function getUserIdentifier(): string
            {
                return (string) $this->id;
            }
        };

        $userEntity->setId($user['id']);
        $userEntity->setEmail($user['email']);
        $userEntity->setPassword($user['pass']);
        $userEntity->setUsergrpid($user['usergrpid']);

        return $userEntity;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!($user instanceof \Symfony\Component\Security\Core\User\UserInterface)) {
            throw new \InvalidArgumentException(sprintf('Invalid user class "%s".', get_class($user)));
        }

        return $this->loadUserByIdentifier($user->getUserIdentifier());
    }

    public function supportsClass(string $class): bool
    {
        return \Symfony\Component\Security\Core\User\UserInterface::class === $class;
    }
}
import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import { CapsuleCollider, RigidBody, RapierRigidBody, useRapier } from '@react-three/rapier';
import { useStore } from './store';

// HTML-matched physics configuration
const PLAYER_HEIGHT = 1.6;
const PLAYER_RADIUS = 0.4;
const BASE_MOVE_SPEED = 20;
const SPRINT_MULTIPLIER = 4;
const JUMP_VELOCITY = 6;
const GRAVITY = -20;

const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export function Player() {
    const rigidBody = useRef<RapierRigidBody>(null);
    const { camera, scene } = useThree();
    const [, get] = useKeyboardControls();
    const viewMode = useStore((s) => s.viewMode);
    const chapter = useStore((s) => s.currentChapter);
    const { rapier, world } = useRapier();

    const [playerOnFloor, setPlayerOnFloor] = useState(false);
    const [currentMoveSpeed, setCurrentMoveSpeed] = useState(BASE_MOVE_SPEED);
    const playerVelocity = useRef(new THREE.Vector3());
    const raycaster = useRef(new THREE.Raycaster());
    const colliderMeshes = useRef<THREE.Mesh[]>([]);

    // Collect collider meshes when entering scene 5
    useFrame(() => {
        if (chapter === 5 && viewMode === 'fps' && colliderMeshes.current.length === 0) {
            scene.traverse((child) => {
                if (child.userData.isCollider && child instanceof THREE.Mesh) {
                    colliderMeshes.current.push(child);
                }
            });
        }
    });

    useFrame((state, delta) => {
        if (!rigidBody.current || viewMode !== 'fps' || chapter !== 5) return;

        const { forward, backward, left, right, jump, sprint } = get();

        // Update move speed based on sprint
        const moveSpeed = sprint ? BASE_MOVE_SPEED * SPRINT_MULTIPLIER : BASE_MOVE_SPEED;
        setCurrentMoveSpeed(moveSpeed);

        const playerPos = camera.position.clone();

        // Floor detection with raycaster
        raycaster.current.set(playerPos, new THREE.Vector3(0, -1, 0));
        const floorHits = raycaster.current.intersectObjects(colliderMeshes.current);
        const onFloor = floorHits.length > 0 && floorHits[0].distance < PLAYER_HEIGHT + 0.1;

        if (onFloor) {
            playerVelocity.current.y = Math.max(0, playerVelocity.current.y);
            if (jump) {
                playerVelocity.current.y = JUMP_VELOCITY;
            }
            const floorDist = floorHits[0].distance;
            if (floorDist < PLAYER_HEIGHT) {
                playerPos.y += (PLAYER_HEIGHT - floorDist);
            }
        } else {
            playerVelocity.current.y += GRAVITY * delta;
        }

        playerPos.y += playerVelocity.current.y * delta;

        // Apply damping
        playerVelocity.current.x -= playerVelocity.current.x * 10.0 * delta;
        playerVelocity.current.z -= playerVelocity.current.z * 10.0 * delta;

        // Movement direction
        direction.z = Number(forward) - Number(backward);
        direction.x = Number(right) - Number(left);
        direction.normalize();

        if (forward || backward) {
            playerVelocity.current.z -= direction.z * moveSpeed * delta;
        }
        if (left || right) {
            playerVelocity.current.x -= direction.x * moveSpeed * delta;
        }

        // Apply movement relative to camera direction
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const moveX = -playerVelocity.current.x * delta;
        const moveZ = -playerVelocity.current.z * delta;

        // Move forward/backward
        camera.position.addScaledVector(cameraDirection, moveZ);
        // Move left/right (perpendicular to camera direction)
        const perpendicular = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x);
        camera.position.addScaledVector(perpendicular, moveX);

        camera.position.y = playerPos.y;

        // CRITICAL: Prevent camera from going underground (Y minimum = 0)
        camera.position.y = Math.max(0, camera.position.y);

        // Wall collision detection
        const checkPos = new THREE.Vector3(camera.position.x, camera.position.y - PLAYER_HEIGHT / 2, camera.position.z);
        const directions = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, -1)
        ];

        directions.forEach(dir => {
            raycaster.current.set(checkPos, dir);
            const wallHits = raycaster.current.intersectObjects(colliderMeshes.current);
            if (wallHits.length > 0 && wallHits[0].distance < PLAYER_RADIUS) {
                const penetration = PLAYER_RADIUS - wallHits[0].distance;
                camera.position.x -= dir.x * (penetration + 0.01);
                camera.position.z -= dir.z * (penetration + 0.01);
                if (dir.x !== 0) playerVelocity.current.x = 0;
                if (dir.z !== 0) playerVelocity.current.z = 0;
            }
        });

        // Final floor check
        raycaster.current.set(camera.position, new THREE.Vector3(0, -1, 0));
        const finalFloor = raycaster.current.intersectObjects(colliderMeshes.current);
        setPlayerOnFloor(finalFloor.length > 0 && finalFloor[0].distance < PLAYER_HEIGHT + 0.1);
    });

    if (viewMode !== 'fps' || chapter !== 5) return null;

    return (
        <group>
            <PointerLockControls selector="#root" />
        </group>
    );
}

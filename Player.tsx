import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useStore } from './store';

const BASE_SPEED = 5;
const SPRINT_MULTIPLIER = 2.5;
const JUMP_FORCE = 6;

const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export function Player() {
    const rigidBody = useRef<RapierRigidBody>(null);
    const { camera } = useThree();
    const [, get] = useKeyboardControls();
    const viewMode = useStore((s) => s.viewMode);
    const [isOnFloor, setIsOnFloor] = useState(false);

    useFrame(() => {
        if (!rigidBody.current || viewMode !== 'fps') return;

        const { forward, backward, left, right, jump, sprint } = get();

        // Current speed based on sprint
        const currentSpeed = sprint ? BASE_SPEED * SPRINT_MULTIPLIER : BASE_SPEED;

        // Calculate movement direction
        frontVector.set(0, 0, Number(backward) - Number(forward));
        sideVector.set(Number(left) - Number(right), 0, 0);

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(currentSpeed)
            .applyEuler(camera.rotation);

        // Get current velocity
        const linvel = rigidBody.current.linvel();

        // Check if on floor (velocity close to zero and not falling fast)
        const onFloor = Math.abs(linvel.y) < 0.5;
        setIsOnFloor(onFloor);

        // Handle jump
        let newY = linvel.y;
        if (jump && onFloor) {
            newY = JUMP_FORCE;
        }

        // Apply velocity (keep Y for gravity/jump, set X/Z for movement)
        rigidBody.current.setLinvel({ x: direction.x, y: newY, z: direction.z }, true);

        // Sync camera to body (eye height 1.6m)
        const pos = rigidBody.current.translation();
        camera.position.set(pos.x, pos.y + 0.8, pos.z);
    });

    if (viewMode !== 'fps') return null;

    return (
        <group>
            <PointerLockControls selector="#root" />
            <RigidBody
                ref={rigidBody}
                colliders={false}
                mass={75}
                type="dynamic"
                position={[1.4, 3, -0.6]}
                enabledRotations={[false, false, false]}
                linearDamping={8}
                friction={1}
            >
                <CapsuleCollider args={[0.6, 0.35]} />
            </RigidBody>
        </group>
    );
}

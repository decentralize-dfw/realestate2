import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useStore } from './store';

const SPEED = 4;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export function Player() {
    const rigidBody = useRef<RapierRigidBody>(null);
    const { camera } = useThree();
    const [, get] = useKeyboardControls();
    const viewMode = useStore((s) => s.viewMode);

    useFrame(() => {
        if (!rigidBody.current || viewMode !== 'fps') return;

        const { forward, backward, left, right } = get();

        // 1. Calculate Impulse Vectors based on Input
        frontVector.set(0, 0, Number(backward) - Number(forward));
        sideVector.set(Number(left) - Number(right), 0, 0);

        // 2. Determine Direction relative to Camera look
        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED)
            .applyEuler(camera.rotation);

        // 3. Apply Velocity to Physics Body manually
        // This fixes "wall climbing" by not using forces, but setting velocity directly.
        const linvel = rigidBody.current.linvel();
        // Keep existing Y velocity (gravity), override X/Z
        rigidBody.current.setLinvel({ x: direction.x, y: linvel.y, z: direction.z }, true);

        // 4. Sync Camera to Body
        const pos = rigidBody.current.translation();
        camera.position.set(pos.x, pos.y + 1.6, pos.z); // 1.6m eye height
    });

    if (viewMode !== 'fps') return null;

    return (
        <group>
            <PointerLockControls selector="#root" />
            <RigidBody 
                ref={rigidBody} 
                colliders={false} 
                mass={1} 
                type="dynamic" 
                position={[1.4, 5, -0.6]} // Start position in interior
                enabledRotations={[false, false, false]} // CRITICAL: Locks rotation so capsule doesn't tip over
                friction={0}
            >
                <CapsuleCollider args={[0.75, 0.4]} />
            </RigidBody>
        </group>
    );
}

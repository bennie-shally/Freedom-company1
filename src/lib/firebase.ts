/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Config provided by user in request
const firebaseConfig = {
  apiKey: "AIzaSyDrh8GJzIbV7OsSEqO2wXVaiYAz_UKBO9w",
  authDomain: "freedom-company-63a44.firebaseapp.com",
  projectId: "freedom-company-63a44",
  storageBucket: "freedom-company-63a44.firebasestorage.app",
  messagingSenderId: "164186684001",
  appId: "1:164186684001:web:fa8202168207ee70a20820",
  measurementId: "G-S7QFDZTNZL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

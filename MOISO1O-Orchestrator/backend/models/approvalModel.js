import { useState, useEffect, useCallback } from "react"


function ApprovalQueue() {
    return (
        <div>
            <main>
                <div>
                    {/* total pending */}
                    <p>Total pending</p>
                    {count}
                </div>
            </main>
        </div>
    )
}

export default ApprovalQueue
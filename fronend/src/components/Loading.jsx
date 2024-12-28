import React, { useEffect, useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";

function Loading({ show }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(show);
    }, [show]); // This will run whenever `show` changes

    return loading && (
        <div className="flex justify-center items-center ">
            <ClipLoader
                color="4f46e5"
                loading={loading}
                size={50}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    );
}

export default Loading;
